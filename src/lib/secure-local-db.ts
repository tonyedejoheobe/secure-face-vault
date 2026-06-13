/*
Secure local persistence for vault metadata + file blobs.

Security model (client-only):
- Data is encrypted at rest in the browser using a key derived from the passcode PIN.
- The PIN is never stored in plaintext.
- Without re-entering the passcode, data cannot be decrypted.

Limitations:
- This does not secure against a fully compromised browser session/device.
*/

export type LocalVaultFile = {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
  // Encrypted payload (file bytes)
  cipherTextB64: string;
  ivB64: string;
  // Optional: store original content type for correct download
  contentType?: string;
};

const DB_NAME = "face_vault_secure_db";
const DB_VERSION = 1;
const STORE_NAME = "vault_files";

function b64ToU8(b64: string) {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

function u8ToB64(u8: Uint8Array) {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    bin += String.fromCharCode(...u8.subarray(i, i + chunk));
  }
  return btoa(bin);
}

async function deriveKeyFromPin(pin: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const pinBytes = enc.encode(pin);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    pinBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  // Ensure salt is a plain ArrayBuffer (some TS lib dom types can be picky about ArrayBufferLike)
  const saltBuf = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength);
  const saltArr = new Uint8Array(saltBuf);
  const saltForWebCrypto: Uint8Array = saltArr.slice(0);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltForWebCrypto,
      iterations: 210_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// Fixed salt strategy:
// - We store a per-user salt in localStorage keyed by userId.
// - This lets us derive the same key each time from the same PIN.
function saltKey(userId: string) {
  return `vault_salt_${userId}`;
}

async function getOrCreateSalt(userId: string) {
  const existing = localStorage.getItem(saltKey(userId));
  if (existing) return b64ToU8(existing);
  const saltArr = crypto.getRandomValues(new Uint8Array(16));
  const salt = saltArr.slice(0);
  localStorage.setItem(saltKey(userId), u8ToB64(salt));
  return salt;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("byUser", "userId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

type EncryptedRecord = {
  id: string;
  userId: string;
  file_name: string;
  file_size: number;
  created_at: string;
  ivB64: string;
  cipherTextB64: string;
  contentType?: string;
};

async function encryptBytes(pin: string, userId: string, plain: Uint8Array) {
  const salt = await getOrCreateSalt(userId);
  const key = await deriveKeyFromPin(pin, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plain,
  );
  return { ivB64: u8ToB64(iv), cipherTextB64: u8ToB64(new Uint8Array(cipher)) };
}

async function decryptBytes(pin: string, userId: string, ivB64: string, cipherTextB64: string) {
  const salt = await getOrCreateSalt(userId);
  const key = await deriveKeyFromPin(pin, salt);
  const iv = b64ToU8(ivB64);
  const cipher = b64ToU8(cipherTextB64);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher,
  );
  return new Uint8Array(plain);
}

export async function localSaveFile(params: {
  userId: string;
  pin: string; // 6-digit pin (plaintext only in memory)
  file: File;
  // Optional stable id; else generated
  id?: string;
}) {
  const { userId, pin, file, id } = params;
  const db = await openDb();

  const fileId = id ?? `lf_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const createdAt = new Date().toISOString();

  const buf = await file.arrayBuffer();
  const plain = new Uint8Array(buf.slice(0));
  const { ivB64, cipherTextB64 } = await encryptBytes(pin, userId, plain);

  const record: EncryptedRecord = {
    id: fileId,
    userId,
    file_name: file.name,
    file_size: file.size,
    created_at: createdAt,
    ivB64,
    cipherTextB64,
    contentType: file.type || undefined,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return {
    id: record.id,
    file_name: record.file_name,
    file_size: record.file_size,
    created_at: record.created_at,
  };
}

export async function localListFiles(params: { userId: string }) {
  const { userId } = params;
  const db = await openDb();
  const rows: EncryptedRecord[] = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("byUser");
    const req = index.getAll(IDBKeyRange.only(userId));
    req.onsuccess = () => resolve(req.result as EncryptedRecord[]);
    req.onerror = () => reject(req.error);
  });

  // Return metadata only (no decryption)
  return rows
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((r) => ({
      id: r.id,
      file_name: r.file_name,
      file_size: r.file_size,
      created_at: r.created_at,
    }));
}

export async function localDeleteFile(params: { userId: string; id: string }) {
  const { userId, id } = params;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      const r = req.result as EncryptedRecord | undefined;
      if (!r || r.userId !== userId) {
        resolve();
        return;
      }
      store.delete(id);
    };
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return { ok: true };
}

export async function localLoadDecryptedFile(params: {
  userId: string;
  pin: string;
  id: string;
}) {
  const { userId, pin, id } = params;
  const db = await openDb();

  const record = await new Promise<EncryptedRecord | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result as EncryptedRecord | undefined);
    req.onerror = () => reject(req.error);
  });

  if (!record || record.userId !== userId) throw new Error("Not found");

  const plainBytes = await decryptBytes(pin, userId, record.ivB64, record.cipherTextB64);
  return {
    file_name: record.file_name,
    file_size: record.file_size,
    contentType: record.contentType,
    bytes: plainBytes,
  };
}


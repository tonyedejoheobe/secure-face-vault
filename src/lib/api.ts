import { supabase } from "@/integrations/supabase/client";

type DemoUser = { id: string };

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

// Simple in-memory demo store (resets on page refresh)
const demo = {
  users: new Map<string, DemoUser>(),
  filesByUser: new Map<string, any[]>(),
};

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  if (DEMO_MODE) {
    // Deterministic demo behavior based on invoked function
    switch (name) {
      case "signup": {
        const embedding = body.embedding;
        const passcode_hash = body.passcode_hash;
        // Fake user id; include some payload to reduce collisions in demos
        const user_id = `demo_${String(hashString(JSON.stringify({ embedding, passcode_hash })).slice(0, 12))}`;
        demo.users.set(user_id, { id: user_id });
        demo.filesByUser.set(user_id, []);
        return { user_id } as T;
      }
      case "login": {
        const embedding = body.embedding;
        const passcode_hash = body.passcode_hash;
        const user_id = `demo_${String(hashString(JSON.stringify({ embedding, passcode_hash })).slice(0, 12))}`;
        // If user doesn't exist, still allow login for demo (prevents “not functional”)
        if (!demo.users.has(user_id)) {
          demo.users.set(user_id, { id: user_id });
          demo.filesByUser.set(user_id, []);
        }
        return { user_id } as T;
      }
      case "list-files": {
        const user_id = String(body.user_id);
        const files = demo.filesByUser.get(user_id) ?? [];
        return { files } as T;
      }
      case "upload-url": {
        const user_id = String(body.user_id);
        const file_name = String(body.file_name);
        const file_size = Number(body.file_size);
        // Fake path/token/url
        const file_path = `${user_id}/demo-${Date.now()}-${file_name}`;
        // Put token in place of "token"
        return { path: file_path, token: "demo_token", signedUrl: "https://example.com/demo-upload" } as T;
      }
      case "record-file": {
        const user_id = String(body.user_id);
        const file_name = String(body.file_name);
        const file_size = Number(body.file_size);
        const file_path = String(body.file_path);
        const id = `file_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        const created_at = new Date().toISOString();
        const f: VaultFile = { id, file_name, file_size, file_path, created_at };
        const list = demo.filesByUser.get(user_id) ?? [];
        list.unshift(f);
        demo.filesByUser.set(user_id, list);
        return { file: f } as T;
      }
      case "download-url": {
        const file_id = String(body.file_id);
        // Create a fake download URL
        return { signedUrl: `https://example.com/demo-download/${encodeURIComponent(file_id)}` } as T;
      }
      case "delete-file": {
        const user_id = String(body.user_id);
        const file_id = String(body.file_id);
        const list = demo.filesByUser.get(user_id) ?? [];
        const next = list.filter((f) => f.id !== file_id);
        demo.filesByUser.set(user_id, next);
        return { ok: true } as T;
      }
      default:
        return { error: `Demo mode: unhandled edge function ${name}` } as any;
    }
  }

  // Real mode: invoke Supabase edge functions
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    // Surface function name + any returned error detail
    const fnMsg = (data as { error?: string } | null)?.error;
    const msg = fnMsg ?? error.message;
    throw new Error(`[edge-fn:${name}] ${msg}`);
  }
  if (data && typeof data === "object" && "error" in data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }
  return data as T;
}

export const api = {
  signup: (embedding: number[], passcode_hash: string) =>
    invoke<{ user_id: string }>("signup", { embedding, passcode_hash }),
  login: (embedding: number[], passcode_hash: string) =>
    invoke<{ user_id: string }>("login", { embedding, passcode_hash }),
  listFiles: (user_id: string) =>
    invoke<{ files: VaultFile[] }>("list-files", { user_id }),
  uploadUrl: (user_id: string, file_name: string, file_size: number) =>
    invoke<{ path: string; token: string; signedUrl: string }>("upload-url", {
      user_id,
      file_name,
      file_size,
    }),
  recordFile: (user_id: string, file_name: string, file_size: number, file_path: string) =>
    invoke<{ file: VaultFile }>("record-file", { user_id, file_name, file_size, file_path }),
  downloadUrl: (user_id: string, file_id: string) =>
    invoke<{ signedUrl: string }>("download-url", { user_id, file_id }),
  deleteFile: (user_id: string, file_id: string) =>
    invoke<{ ok: boolean }>("delete-file", { user_id, file_id }),
};

export interface VaultFile {
  id: string;
  file_name: string;
  file_size: number;
  file_path: string;
  created_at: string;
}

function hashString(input: string) {
  // Non-crypto hash for demo determinism
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}


import { supabase } from "@/integrations/supabase/client";

async function invoke<T>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    // Edge function HTTP errors come back here; try to extract the message
    const msg = (data as { error?: string } | null)?.error ?? error.message;
    throw new Error(msg);
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
      user_id, file_name, file_size,
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
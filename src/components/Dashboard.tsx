import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, LogOut, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, type VaultFile } from "@/lib/api";
import { FileList } from "./FileList";
import { toast } from "sonner";

interface Props {
  userId: string;
  onLogout: () => void;
}

export function Dashboard({ userId, onLogout }: Props) {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { files } = await api.listFiles(userId);
      setFiles(files);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const { path, token } = await api.uploadUrl(userId, file.name, file.size);
        const { supabase } = await import("@/integrations/supabase/client");
        const { error: upErr } = await supabase.storage
          .from("vault")
          .uploadToSignedUrl(path, token, file);
        if (upErr) throw upErr;
        await api.recordFile(userId, file.name, file.size, path);
      }
      toast.success("Upload complete");
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (f: VaultFile) => {
    setBusyId(f.id);
    try {
      const { signedUrl } = await api.downloadUrl(userId, f.id);
      window.open(signedUrl, "_blank");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (f: VaultFile) => {
    if (!confirm(`Delete "${f.file_name}"?`)) return;
    setBusyId(f.id);
    try {
      await api.deleteFile(userId, f.id);
      setFiles((xs) => xs.filter((x) => x.id !== f.id));
      toast.success("Deleted");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-white">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <span className="font-semibold">Face Vault</span>
        </div>
        <Button variant="ghost" onClick={onLogout} className="text-white/70 hover:text-white hover:bg-white/10">
          <LogOut className="w-4 h-4 mr-2" /> Lock
        </Button>
      </header>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all backdrop-blur-xl bg-white/5 ${
          dragOver ? "border-emerald-400 bg-emerald-400/5" : "border-white/15 hover:border-white/30"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-white/80">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/70">
            <Upload className="w-7 h-7" />
            <div className="text-sm">
              <span className="text-white font-medium">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-white/40">Max 50 MB per file</div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
        <h3 className="text-sm font-medium text-white/80 mb-2 px-1">Your files</h3>
        <FileList
          files={files}
          loading={loading}
          busyId={busyId}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
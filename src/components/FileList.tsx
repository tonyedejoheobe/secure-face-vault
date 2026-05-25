import { Download, Trash2, FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VaultFile } from "@/lib/api";

interface Props {
  files: VaultFile[];
  onDownload: (f: VaultFile) => void;
  onDelete: (f: VaultFile) => void;
  busyId?: string | null;
  loading?: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function FileList({ files, onDownload, onDelete, busyId, loading }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-white/60" />
      </div>
    );
  }
  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-white/50 text-sm">
        No files yet. Drop something to get started.
      </div>
    );
  }
  return (
    <div className="divide-y divide-white/5">
      {files.map((f) => (
        <div key={f.id} className="flex items-center gap-3 py-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <FileIcon className="w-5 h-5 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{f.file_name}</div>
            <div className="text-xs text-white/40">
              {formatSize(f.file_size)} • {new Date(f.created_at).toLocaleString()}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => onDownload(f)}
            disabled={busyId === f.id}
          >
            {busyId === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-red-400/80 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => onDelete(f)}
            disabled={busyId === f.id}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
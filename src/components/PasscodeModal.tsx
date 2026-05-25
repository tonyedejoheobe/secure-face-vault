import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Delete, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  mode: "signup" | "login";
  loading?: boolean;
  onSubmit: (passcode: string) => void;
  onCancel: () => void;
}

export function PasscodeModal({ open, mode, loading, onSubmit, onCancel }: Props) {
  const [pin, setPin] = useState("");

  const handleDigit = (d: string) => {
    if (pin.length >= 6 || loading) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 6) {
      setTimeout(() => {
        onSubmit(next);
        setPin("");
      }, 150);
    }
  };

  const handleDelete = () => !loading && setPin((p) => p.slice(0, -1));

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onCancel(); setPin(""); } }}>
      <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>{mode === "signup" ? "Create Your Passcode" : "Enter Your Passcode"}</DialogTitle>
          <DialogDescription className="text-white/60">
            {mode === "signup"
              ? "Choose a 6-digit code. You'll need both your face and this code to unlock your vault."
              : "Enter your 6-digit code to unlock your vault."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 my-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-12 rounded-lg border flex items-center justify-center text-xl font-mono transition-colors ${
                pin.length > i ? "border-emerald-400 bg-emerald-400/10" : "border-white/15 bg-white/5"
              }`}
            >
              {pin.length > i ? "•" : ""}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-white/70" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {["1","2","3","4","5","6","7","8","9"].map((d) => (
              <Button
                key={d}
                variant="secondary"
                className="h-14 text-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                onClick={() => handleDigit(d)}
              >
                {d}
              </Button>
            ))}
            <div />
            <Button
              variant="secondary"
              className="h-14 text-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
              onClick={() => handleDigit("0")}
            >
              0
            </Button>
            <Button
              variant="secondary"
              className="h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white"
              onClick={handleDelete}
            >
              <Delete className="w-5 h-5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { useEffect, useState } from "react";
import { ShieldCheck, ScanFace, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { WebcamAuth } from "./WebcamAuth";
import { PasscodeModal } from "./PasscodeModal";
import { Dashboard } from "./Dashboard";
import { api } from "@/lib/api";
import { sha256 } from "@/lib/face";

type Stage = "idle" | "capturing" | "passcode" | "authed";
type Mode = "signup" | "login";

export function VaultApp() {
  const [stage, setStage] = useState<Stage>("idle");
  const [mode, setMode] = useState<Mode>("login");
  const [descriptor, setDescriptor] = useState<number[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("vault_user_id");
    if (saved) { setUserId(saved); setStage("authed"); }
  }, []);

  const start = (m: Mode) => { setMode(m); setStage("capturing"); setDescriptor(null); };
  const reset = () => { setStage("idle"); setDescriptor(null); setSubmitting(false); };

  const handleCapture = (d: number[]) => {
    setDescriptor(d);
    setStage("passcode");
  };

  const handlePasscode = async (pin: string) => {
    if (!descriptor) return;
    setSubmitting(true);
    try {
      const hash = await sha256(pin);
      const result = mode === "signup"
        ? await api.signup(descriptor, hash)
        : await api.login(descriptor, hash);
      sessionStorage.setItem("vault_user_id", result.user_id);
      setUserId(result.user_id);
      setStage("authed");
      toast.success(mode === "signup" ? "Vault created" : "Welcome back");
    } catch (e) {
      const msg = (e as Error).message;
      // Generic message for login failures to prevent enumeration
      toast.error(mode === "login" ? "Authentication failed" : msg);
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("vault_user_id");
    setUserId(null);
    setStage("idle");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.08),_transparent_60%)] bg-zinc-950">
      <Toaster theme="dark" position="top-center" richColors />
      <div className="min-h-screen w-full px-4 py-10 flex items-center justify-center">
        {stage === "authed" && userId ? (
          <Dashboard userId={userId} onLogout={logout} />
        ) : (
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8 shadow-2xl">
              <div className="flex flex-col items-center gap-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-semibold text-white">Face Vault</h1>
                <p className="text-sm text-white/60 text-center">
                  Secure file storage protected by your face and a passcode. No usernames, no passwords.
                </p>
              </div>

              {stage === "idle" && (
                <div className="flex flex-col gap-3">
                  <Button
                    className="h-12 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium"
                    onClick={() => start("login")}
                  >
                    <ScanFace className="w-4 h-4 mr-2" /> Access Storage
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                    onClick={() => start("signup")}
                  >
                    <KeyRound className="w-4 h-4 mr-2" /> Initialize Storage
                  </Button>
                </div>
              )}

              {(stage === "capturing" || stage === "passcode") && (
                <div className="flex flex-col items-center gap-4">
                  <WebcamAuth mode={mode} onCapture={handleCapture} />
                  <Button
                    variant="ghost"
                    className="text-white/60 hover:text-white hover:bg-white/5"
                    onClick={reset}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-white/30 mt-6">
              Your face is processed in your browser. Only a 128-dim numeric vector is stored.
            </p>
          </div>
        )}

        <PasscodeModal
          open={stage === "passcode"}
          mode={mode}
          loading={submitting}
          onSubmit={handlePasscode}
          onCancel={reset}
        />
      </div>
    </div>
  );
}
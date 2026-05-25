import { useEffect, useRef, useState } from "react";
import { Loader2, Camera, CheckCircle2 } from "lucide-react";
import { loadFaceModels, detectFace } from "@/lib/face";
import { toast } from "sonner";

interface Props {
  onCapture: (descriptor: number[]) => void;
  mode: "signup" | "login";
}

export function WebcamAuth({ onCapture, mode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "detected" | "captured" | "error">("loading");
  const [message, setMessage] = useState("Loading face recognition models…");
  const capturedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let detectInterval: number | undefined;
    let noFaceTimer: number | undefined;

    (async () => {
      try {
        await loadFaceModels();
        if (cancelled) return;
        setMessage("Requesting camera access…");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("ready");
        setMessage("Position your face in the frame");

        noFaceTimer = window.setTimeout(() => {
          if (!capturedRef.current) {
            toast.error("Ensure you are in a well-lit room and facing the camera directly.");
          }
        }, 5000);

        detectInterval = window.setInterval(async () => {
          if (capturedRef.current || !videoRef.current) return;
          const result = await detectFace(videoRef.current);
          if (result && result.descriptor) {
            setStatus("detected");
            setMessage("Face detected — hold still…");
            // capture after a brief stable moment
            await new Promise((r) => setTimeout(r, 600));
            const second = await detectFace(videoRef.current);
            if (second && second.descriptor && !capturedRef.current) {
              capturedRef.current = true;
              setStatus("captured");
              setMessage("Face captured");
              onCapture(Array.from(second.descriptor));
            }
          } else if (status !== "captured") {
            setStatus("ready");
          }
        }, 700);
      } catch (e) {
        console.error(e);
        setStatus("error");
        setMessage("Could not access camera. Please grant permission and reload.");
      }
    })();

    return () => {
      cancelled = true;
      if (detectInterval) clearInterval(detectInterval);
      if (noFaceTimer) clearTimeout(noFaceTimer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const borderColor =
    status === "detected" || status === "captured"
      ? "border-emerald-400 shadow-[0_0_30px_-5px_rgba(52,211,153,0.6)]"
      : status === "error"
        ? "border-red-500/60"
        : "border-white/20";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white">
          {mode === "signup" ? "Initialize Your Vault" : "Verify Identity"}
        </h2>
        <p className="text-sm text-white/60 mt-1">{message}</p>
      </div>
      <div className={`relative rounded-2xl overflow-hidden border-2 transition-all ${borderColor}`}>
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-[360px] h-[270px] object-cover bg-black scale-x-[-1]"
        />
        {/* Scanning overlay */}
        <div className="pointer-events-none absolute inset-6 border border-dashed border-white/40 rounded-xl" />
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
        {status === "captured" && (
          <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Captured
          </div>
        )}
        {status === "ready" && (
          <div className="absolute top-3 right-3 bg-white/10 backdrop-blur text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Camera className="w-3 h-3" /> Scanning
          </div>
        )}
      </div>
    </div>
  );
}
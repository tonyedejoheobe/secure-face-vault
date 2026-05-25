import { Link } from "@tanstack/react-router";
import {
  ShieldCheck, ScanFace, KeyRound, Lock, Cpu, EyeOff, Upload,
  FileLock2, Sparkles, ArrowRight, Github, Fingerprint, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/60 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center group-hover:bg-emerald-400/20 transition-colors">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-white font-semibold tracking-tight">Face Vault</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <Link to="/vault">
          <Button className="h-9 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium">
            Open Vault <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.12),_transparent_55%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/70 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          End-to-end biometric authentication
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05]">
          Your face is the
          <span className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
            only key you need.
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
          Encrypted file storage unlocked by face recognition and a 6-digit passcode.
          No usernames. No passwords. No data brokers.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/vault">
            <Button className="h-12 px-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium">
              <ScanFace className="w-4 h-4 mr-2" /> Access Storage
            </Button>
          </Link>
          <Link to="/vault">
            <Button variant="secondary" className="h-12 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white">
              <KeyRound className="w-4 h-4 mr-2" /> Initialize Storage
            </Button>
          </Link>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/40">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" /> On-device biometrics</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" /> SHA-256 passcode hashing</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" /> Signed URL file access</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" /> Zero-knowledge architecture</span>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Fingerprint, title: "Biometric login", text: "A 128-dimensional face vector unlocks your vault — never an image, never a password." },
  { icon: Cpu, title: "Runs in your browser", text: "face-api.js processes every frame locally. Your camera feed never leaves the device." },
  { icon: Lock, title: "Two-factor by design", text: "Face match plus a 6-digit passcode. Either alone is useless to an attacker." },
  { icon: FileLock2, title: "Private storage", text: "Files are isolated per identity behind short-lived signed URLs. No public buckets, ever." },
  { icon: EyeOff, title: "No accounts, no tracking", text: "We don't ask for an email. There is no profile to harvest, no password to leak." },
  { icon: Upload, title: "Drag, drop, done", text: "Upload anything up to 50 MB. Download with a tap. Delete leaves no residue." },
];

function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-3">Built for privacy</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">A vault that forgets everything but you.</h2>
          <p className="mt-4 text-white/60">Every primitive — auth, storage, transport — is designed so that nobody, including us, can read what you store.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-xl p-6 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <f.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-medium">{f.title}</h3>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Look at the camera", text: "Your browser extracts a numeric face descriptor on-device. The image is discarded immediately." },
  { n: "02", title: "Enter your 6-digit passcode", text: "Hashed with SHA-256 before it ever leaves your device — we never see the plaintext PIN." },
  { n: "03", title: "Vault unlocked", text: "A short-lived session grants access to your encrypted files behind signed download URLs." },
];

function HowItWorks() {
  return (
    <section id="how" className="relative py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-3">How it works</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">Three seconds to your files.</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <div className="text-emerald-400/80 text-sm font-mono">{s.n}</div>
              <h3 className="mt-3 text-white text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  const points = [
    "Face descriptors are 128-dim vectors — non-reversible to images.",
    "Passcodes are SHA-256 hashed in the browser before transit.",
    "Database access is deny-by-default; every operation runs through audited server functions.",
    "Storage uses a private bucket; downloads use short-lived signed URLs.",
    "Match threshold tuned to 0.45 Euclidean distance to resist false positives.",
    "Failed authentication returns a single generic error to prevent enumeration.",
  ];
  return (
    <section id="security" className="relative py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-3">Security model</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">Threat-modeled, not theatre.</h2>
          <p className="mt-4 text-white/60">We started by listing every way someone could break in. Then we made each one impossible.</p>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-white/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-400/70" />
              <div className="w-2 h-2 rounded-full bg-yellow-400/70" />
              <div className="w-2 h-2 rounded-full bg-emerald-400/70" />
              <span className="ml-3 text-xs text-white/40 font-mono">auth-flow.ts</span>
            </div>
            <pre className="text-[12.5px] leading-relaxed text-white/80 font-mono overflow-x-auto">
{`// 1. extract descriptor locally
const descriptor = await getFaceDescriptor(video);

// 2. hash passcode before transit
const hash = await sha256(pin);

// 3. server-side match + verify
const { user_id } = await api.login(
  descriptor,  // 128-dim vector
  hash         // sha-256 digest
);

// no plaintext, no image, no password.`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  { q: "What happens if I lose my passcode?", a: "Your vault is intentionally unrecoverable without both factors. There is no reset email because there is no email — that's the point. Initialize a new vault to start over." },
  { q: "Can someone unlock my vault with a photo?", a: "The detector requires a live, stable face frame. Combined with a high-confidence match threshold and the secondary passcode, photo attacks are infeasible." },
  { q: "Is my face stored as an image?", a: "No. Only a 128-dimensional numeric vector derived from your face is stored. The original frame is discarded the moment the descriptor is computed." },
  { q: "What file types and sizes are allowed?", a: "Any file format, up to 50 MB per upload. Storage is private to your identity and not shared, indexed, or scanned." },
];

function FAQ() {
  return (
    <section id="faq" className="relative py-24 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-3 text-center">FAQ</p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white text-center">Questions, answered.</h2>
        <div className="mt-12 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] open:bg-white/[0.05] p-5 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer list-none text-white font-medium">
                {f.q}
                <span className="ml-4 text-emerald-400/70 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative py-24 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-950 p-10 md:p-14 text-center">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />
          <h2 className="relative text-3xl md:text-5xl font-semibold tracking-tight text-white">
            Ready to lock it down?
          </h2>
          <p className="relative mt-4 text-white/60 max-w-xl mx-auto">
            Set up your vault in under a minute. No signup forms, no verification emails — just your face and a passcode.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link to="/vault">
              <Button className="h-12 px-8 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium">
                Initialize your vault <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400/70" />
          <span>Face Vault — passwordless by design.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Security />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
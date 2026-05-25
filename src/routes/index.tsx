import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Face Vault — Passwordless encrypted file storage" },
      { name: "description", content: "Secure file vault unlocked by your face and a 6-digit passcode. No usernames, no passwords. Your biometric never leaves your browser." },
      { property: "og:title", content: "Face Vault — Passwordless encrypted file storage" },
      { property: "og:description", content: "Secure file vault unlocked by your face and a 6-digit passcode. Your biometric never leaves your browser." },
    ],
  }),
  component: Index,
});

function Index() {
  return <Landing />;
}

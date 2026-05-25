import { createFileRoute } from "@tanstack/react-router";
import { VaultApp } from "@/components/VaultApp";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Vault — Face Vault" },
      { name: "description", content: "Unlock your encrypted vault with your face and 6-digit passcode." },
      { property: "og:title", content: "Vault — Face Vault" },
      { property: "og:description", content: "Unlock your encrypted vault with your face and 6-digit passcode." },
    ],
  }),
  component: () => <VaultApp />,
});
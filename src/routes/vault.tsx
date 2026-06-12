import { createFileRoute } from "@tanstack/react-router";
import { VaultApp } from "@/components/VaultApp";

export const Route = createFileRoute("/vault")({
  component: () => <VaultApp />,
});
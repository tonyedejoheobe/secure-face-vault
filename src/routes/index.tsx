import { createFileRoute } from "@tanstack/react-router";
import { VaultApp } from "@/components/VaultApp";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <VaultApp />;
}

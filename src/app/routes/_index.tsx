import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";

export const meta: MetaFunction = () => [
  { title: "Cobblemon Hub" },
  { name: "description", content: "Plataforma para jogadores do mod Cobblemon" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Home" />;
}

export default function Index() {
  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-primary">Cobblemon Hub</h1>
    </div>
  );
}

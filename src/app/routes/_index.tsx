import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Cobblemon Hub" },
  { name: "description", content: "Plataforma para jogadores do mod Cobblemon" },
];

export default function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold text-primary">Cobblemon Hub</h1>
    </main>
  );
}

import { useState } from "react";
import type { MetaFunction } from "react-router";
import { RouteErrorBoundary } from "~/components/layout/route-error-boundary";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Flame, Zap, Shield, Sparkles, Gem, ChevronRight } from "lucide-react";

export const meta: MetaFunction = () => [
  { title: "Mecanicas de Batalha — Cobbleverse Hub" },
  { name: "description", content: "Mega Evolution, Z-Moves, Dynamax e Terastallization no Cobbleverse" },
];

export function ErrorBoundary() {
  return <RouteErrorBoundary routeName="Mecanicas de Batalha" />;
}

interface Mechanic {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  description: string;
  howItWorks: string[];
  keyFacts: { label: string; value: string }[];
}

const MECHANICS: Mechanic[] = [
  {
    id: "mega",
    name: "Mega Evolution",
    icon: Flame,
    color: "text-red-500",
    borderColor: "border-red-500/30 bg-red-500/5",
    description: "Transforme seu Pokemon em uma versao mais poderosa durante a batalha. O Cobbleverse inclui todas as 93 Mega Evolucoes.",
    howItWorks: [
      "Obtenha a Mega Stone especifica do seu Pokemon",
      "Equipe a Mega Stone como held item",
      "Durante a batalha, selecione a opcao de Mega Evolucao antes de atacar",
      "A Mega Evolucao dura ate o fim da batalha",
      "Apenas 1 Mega Evolucao por batalha por treinador",
    ],
    keyFacts: [
      { label: "Total de Megas", value: "93" },
      { label: "Mega Stones", value: "Held Item" },
      { label: "Duracao", value: "1 Batalha" },
      { label: "Limite", value: "1 por batalha" },
    ],
  },
  {
    id: "zmoves",
    name: "Z-Moves",
    icon: Zap,
    color: "text-amber-500",
    borderColor: "border-amber-500/30 bg-amber-500/5",
    description: "Movimentos ultra-poderosos que podem ser usados uma vez por batalha. Cada tipo tem seu Z-Move correspondente, alem de Z-Moves exclusivos.",
    howItWorks: [
      "Obtenha o Z-Crystal do tipo desejado",
      "Equipe o Z-Crystal no Pokemon como held item",
      "O Pokemon precisa conhecer um movimento do mesmo tipo do Z-Crystal",
      "Selecione Z-Move durante a batalha para desferir um golpe devastador",
      "Movimentos de status ganham efeitos bonus com Z-Power",
    ],
    keyFacts: [
      { label: "Z-Crystals", value: "18 tipos + especiais" },
      { label: "Requisito", value: "Move do mesmo tipo" },
      { label: "Uso", value: "1 por batalha" },
      { label: "Dano", value: "Muito alto" },
    ],
  },
  {
    id: "dynamax",
    name: "Dynamax / Gigantamax",
    icon: Shield,
    color: "text-purple-500",
    borderColor: "border-purple-500/30 bg-purple-500/5",
    description: "Seu Pokemon cresce enormemente, ganhando HP bonus e movimentos Max. Alguns Pokemon possuem formas Gigantamax exclusivas com G-Max Moves unicos.",
    howItWorks: [
      "Dynamax pode ser ativado em batalhas de Raid e arenas especificas",
      "O Pokemon dobra seu HP e seus movimentos se tornam Max Moves",
      "Max Moves tem efeitos secundarios baseados no tipo (clima, terrain, etc.)",
      "Gigantamax: formas especiais com G-Max Moves exclusivos",
      "Dura 3 turnos antes de voltar ao tamanho normal",
    ],
    keyFacts: [
      { label: "HP Bonus", value: "x2" },
      { label: "Duracao", value: "3 turnos" },
      { label: "G-Max Forms", value: "Varios" },
      { label: "Onde usar", value: "Raids / Arenas" },
    ],
  },
  {
    id: "tera",
    name: "Terastallization",
    icon: Gem,
    color: "text-cyan-500",
    borderColor: "border-cyan-500/30 bg-cyan-500/5",
    description: "Mude o tipo do seu Pokemon durante a batalha com Terastallization. O Tera Type pode ser diferente dos tipos originais, criando estrategias unicas.",
    howItWorks: [
      "Cada Pokemon tem um Tera Type (pode ser qualquer um dos 18 tipos)",
      "Ative Terastallization durante a batalha para mudar o tipo do Pokemon",
      "Movimentos STAB ganham um boost adicional com o Tera Type",
      "Se o Tera Type coincide com o tipo original, o boost de STAB e ainda maior",
      "Dura ate o fim da batalha",
    ],
    keyFacts: [
      { label: "Tipos disponiveis", value: "18" },
      { label: "STAB Bonus", value: "Aumentado" },
      { label: "Duracao", value: "1 Batalha" },
      { label: "Uso", value: "1 por batalha" },
    ],
  },
];

function MechanicCard({ mechanic }: { mechanic: Mechanic }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = mechanic.icon;

  return (
    <Card className={cn("border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-300", expanded && "shadow-[0_0_20px_-4px_hsl(var(--primary)/0.1)]")}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-t-xl"
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border shrink-0", mechanic.borderColor)}>
              <Icon size={18} className={mechanic.color} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{mechanic.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5 line-clamp-1">
                {mechanic.description}
              </CardDescription>
            </div>
            <ChevronRight
              size={16}
              className={cn("shrink-0 text-muted-foreground/40 transition-transform duration-200", expanded && "rotate-90")}
            />
          </div>
        </CardHeader>
      </button>

      {expanded && (
        <CardContent className="pt-0">
          <Separator className="mb-4 opacity-30" />

          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {mechanic.description}
          </p>

          {/* Key facts */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {mechanic.keyFacts.map((fact) => (
              <div key={fact.label} className="rounded-lg border border-border/20 bg-muted/10 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">{fact.label}</div>
                <div className="text-xs font-bold text-foreground mt-0.5">{fact.value}</div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-2">
            Como funciona
          </h4>
          <ol className="space-y-1.5">
            {mechanic.howItWorks.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className={cn("flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold shrink-0 mt-0.5", mechanic.borderColor, mechanic.color)}>
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      )}
    </Card>
  );
}

export default function BattleMechanicsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          Mecanicas de Batalha
        </h1>
        <p className="text-sm text-muted-foreground">
          Mega Evolution, Z-Moves, Dynamax e Terastallization — tudo disponivel no Cobbleverse
        </p>
      </div>

      {/* Overview badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="outline" className="border-red-500/30 text-red-500 text-[10px]">
          <Flame size={10} className="mr-1" />
          93 Mega Evolucoes
        </Badge>
        <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
          <Zap size={10} className="mr-1" />
          Z-Moves
        </Badge>
        <Badge variant="outline" className="border-purple-500/30 text-purple-500 text-[10px]">
          <Shield size={10} className="mr-1" />
          Dynamax & G-Max
        </Badge>
        <Badge variant="outline" className="border-cyan-500/30 text-cyan-500 text-[10px]">
          <Gem size={10} className="mr-1" />
          Terastallization
        </Badge>
      </div>

      <div className="space-y-3">
        {MECHANICS.map((mechanic) => (
          <MechanicCard key={mechanic.id} mechanic={mechanic} />
        ))}
      </div>

      <Card className="mt-6 border-border/20 bg-card/20 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Sparkles size={14} className="text-muted-foreground/40 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              Todas as mecanicas sao fornecidas pelo mod <strong className="text-foreground">Cobblemon Mega Showdown</strong> incluido no Cobbleverse.
              Apenas uma mecanica de transformacao pode ser usada por batalha (Mega OU Z-Move OU Dynamax OU Tera).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

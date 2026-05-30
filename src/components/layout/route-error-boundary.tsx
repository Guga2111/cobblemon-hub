import { useEffect } from "react";
import { useRouteError, isRouteErrorResponse, useNavigate, useLocation, Link } from "react-router";
import { AlertTriangle, RefreshCw, Home, Terminal } from "lucide-react";

interface RouteErrorBoundaryProps {
  routeName: string;
}

function getErrorDetails(error: unknown): {
  errorCode: string;
  heading: string;
  message: string;
  statusCode: number | null;
} {
  if (isRouteErrorResponse(error)) {
    const statusCode = error.status;
    if (statusCode === 404) {
      return {
        errorCode: "ERR_404",
        heading: "Não Encontrado",
        message: "Esta página não existe ou foi movida para outro lugar.",
        statusCode,
      };
    }
    if (statusCode === 403) {
      return {
        errorCode: "ERR_403",
        heading: "Acesso Negado",
        message: "Você não tem permissão para acessar esta área.",
        statusCode,
      };
    }
    return {
      errorCode: `ERR_${statusCode}`,
      heading: error.statusText || "Erro de Rota",
      message: `Ocorreu um erro ${statusCode} ao carregar esta página.`,
      statusCode,
    };
  }
  if (error instanceof Error) {
    return {
      errorCode: `ERR_${error.name.toUpperCase().replace(/\s+/g, "_")}`,
      heading: "Erro de Renderização",
      message:
        error.message.length > 0 && error.message.length < 200
          ? error.message
          : "Houve um problema ao renderizar esta seção.",
      statusCode: null,
    };
  }
  return {
    errorCode: "ERR_UNKNOWN",
    heading: "Sistema Corrompido",
    message: "Algo inesperado aconteceu. Por favor, tente novamente.",
    statusCode: null,
  };
}

export function RouteErrorBoundary({ routeName }: RouteErrorBoundaryProps) {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      `[ErrorBoundary] Route: "${routeName}" | Path: ${location.pathname}${location.search}`,
      error
    );
    if (error instanceof Error && error.stack) {
      console.error(`[ErrorBoundary] Stack:\n${error.stack}`);
    }
  }, [error, routeName, location]);

  const { errorCode, heading, message, statusCode } = getErrorDetails(error);
  const terminalPath = routeName.toLowerCase().replace(/\s+/g, "_");

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-16">
      <style>{`
        @keyframes eb-scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200vh); }
        }
        @keyframes eb-glitch-r {
          0%, 6%, 100% { clip-path: inset(0 0 100% 0); transform: translateX(0); }
          2% { clip-path: inset(35% 0 45% 0); transform: translateX(-4px); }
          4% { clip-path: inset(70% 0 8% 0); transform: translateX(3px); }
          5% { clip-path: inset(10% 0 82% 0); transform: translateX(-2px); }
        }
        @keyframes eb-glitch-b {
          0%, 6%, 100% { clip-path: inset(100% 0 0 0); transform: translateX(0); }
          2% { clip-path: inset(45% 0 35% 0); transform: translateX(4px); }
          4% { clip-path: inset(8% 0 70% 0); transform: translateX(-3px); }
          5% { clip-path: inset(82% 0 5% 0); transform: translateX(2px); }
        }
        @keyframes eb-flicker {
          0%, 96%, 100% { opacity: 1; }
          97% { opacity: 0.75; }
          98% { opacity: 0.95; }
          99% { opacity: 0.6; }
        }
        @keyframes eb-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .eb-glitch-wrap {
          position: relative;
          animation: eb-flicker 6s infinite;
        }
        .eb-glitch-wrap::before {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          color: hsl(0 70% 55%);
          animation: eb-glitch-r 7s infinite 0.1s;
        }
        .eb-glitch-wrap::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          color: hsl(210 80% 65%);
          animation: eb-glitch-b 7s infinite 0.5s;
        }
        .eb-cursor {
          animation: eb-cursor-blink 1s step-end infinite;
        }
        .eb-scanline {
          pointer-events: none;
          position: absolute;
          inset-x: 0;
          top: 0;
          height: 3px;
          background: linear-gradient(to bottom, transparent, rgba(220,38,38,0.06), transparent);
          animation: eb-scanline 10s linear infinite;
        }
      `}</style>

      {/* Drifting scanline */}
      <div className="eb-scanline" aria-hidden="true" />

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-destructive/25 bg-destructive/[0.04] px-4 py-2">
          <Terminal size={11} className="text-destructive/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-destructive/50">
            cobbleverse_hub &gt; {terminalPath}
            <span className="eb-cursor ml-px">█</span>
          </span>
          <div className="ml-auto flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/10" />
          </div>
        </div>

        {/* Main error panel */}
        <div className="rounded-b-lg border border-destructive/25 bg-card px-6 pb-7 pt-6">
          {/* Error code stamp */}
          <div className="mb-3 font-mono text-[10px] tracking-[0.35em] text-destructive/40 uppercase">
            {errorCode}
            {statusCode !== null && ` · http ${statusCode}`}
          </div>

          {/* Glitchy heading */}
          <h1
            className="eb-glitch-wrap mb-5 font-mono text-2xl font-black uppercase tracking-tight text-destructive"
            data-text={heading}
          >
            {heading}
          </h1>

          {/* Friendly message */}
          <div className="mb-6 flex gap-3 rounded-md border border-destructive/15 bg-destructive/[0.06] p-4">
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0 text-destructive"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {message}
            </p>
          </div>

          {/* Stack trace (dev context) */}
          {error instanceof Error && error.stack && (
            <details className="mb-6">
              <summary className="cursor-pointer font-mono text-[10px] text-muted-foreground/40 transition-colors hover:text-muted-foreground/70 select-none">
                ▶ stack trace
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded border border-border/40 bg-muted/20 p-3 font-mono text-[9px] leading-relaxed text-muted-foreground/60">
                {error.stack}
              </pre>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(0)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-destructive/35 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive transition-all duration-200 hover:border-destructive/55 hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <RefreshCw size={14} />
              Tentar novamente
            </button>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Home size={14} />
              Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

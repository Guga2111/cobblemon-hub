import { useState, useCallback, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Share2, Copy, Check, X, Terminal, Link2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useTeamStore } from "~/features/team-builder/use-team-store";
import {
  buildShowdownExport,
  buildShareableUrl,
} from "~/features/team-builder/use-team-export";

// ── Copy button with 2s feedback ──────────────────────────────────────

interface CopyButtonProps {
  text: string;
  variant?: "primary" | "terminal";
  className?: string;
}

function CopyButton({ text, variant = "primary", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 border shrink-0",
        copied
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(52,211,153,0.2)]"
          : variant === "terminal"
            ? "bg-emerald-500/8 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/15 border-emerald-500/20 hover:border-emerald-500/35"
            : "bg-primary/10 text-primary/80 hover:text-primary hover:bg-primary/20 border-primary/20 hover:border-primary/40",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copiar
        </>
      )}
    </button>
  );
}

// ── Export Dialog ─────────────────────────────────────────────────────

export function ExportDialog() {
  const [open, setOpen] = useState(false);
  const slots = useTeamStore((s) => s.slots);
  const filledCount = slots.filter((s) => s.pokemonData !== null).length;

  const showdownText = useMemo(
    () => buildShowdownExport([...slots]),
    [slots]
  );

  const shareUrl = useMemo(
    () => (open ? buildShareableUrl([...slots]) : ""),
    [open, slots]
  );

  const showdownRows = Math.min(
    24,
    Math.max(6, showdownText.split("\n").length + 1)
  );

  if (filledCount === 0) return null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors border border-primary/20 hover:border-primary/40"
        >
          <Share2 className="h-3.5 w-3.5" />
          Exportar
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-2xl max-h-[90vh] overflow-y-auto",
            "rounded-2xl border border-border/50 bg-background shadow-2xl shadow-black/50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "duration-200"
          )}
        >
          {/* Radial glow top */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: "radial-gradient(ellipse, hsl(var(--primary)/0.12) 0%, transparent 70%)" }}
          />

          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-border/30 px-6 pb-4 pt-6">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-base font-bold tracking-tight">
                <Share2 className="h-4 w-4 text-primary/70" />
                Exportar Time
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-muted-foreground/50">
                {filledCount} Pokémon selecionados
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-md p-1.5 text-muted-foreground/40 transition-colors hover:bg-muted/30 hover:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="relative space-y-5 px-6 py-5">
            {/* ── Showdown Format ─── */}
            <section className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-emerald-400/70 shrink-0" />
                    <p className="text-sm font-semibold tracking-tight">
                      Formato Showdown
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground/50">
                    Compatível com Pokémon Showdown e calculadoras de dano
                  </p>
                </div>
                <CopyButton text={showdownText} variant="terminal" />
              </div>

              {/* Terminal textarea */}
              <div className="relative rounded-xl border border-emerald-500/15 bg-[#0a120e]/80 shadow-inner overflow-hidden">
                {/* Scanline overlay */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)",
                  }}
                />
                {/* Glow from top-left */}
                <div className="pointer-events-none absolute left-0 top-0 h-24 w-48 rounded-tl-xl bg-emerald-500/5 blur-2xl" />

                <textarea
                  readOnly
                  value={showdownText}
                  rows={showdownRows}
                  spellCheck={false}
                  className="relative w-full resize-none bg-transparent px-4 py-3 text-xs leading-relaxed text-emerald-300/80 focus:outline-none selection:bg-emerald-500/25"
                  style={{
                    fontFamily:
                      "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Courier New', monospace",
                  }}
                />
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-border/20" />

            {/* ── Shareable URL ─── */}
            <section className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <p className="text-sm font-semibold tracking-tight">
                      URL Compartilhável
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground/50">
                    Link para carregar este time no Team Builder
                  </p>
                </div>
                <CopyButton text={shareUrl} variant="primary" />
              </div>

              <div className="relative rounded-xl border border-border/40 bg-muted/20 px-4 py-2.5 overflow-hidden">
                <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-primary/5 to-transparent" />
                <p
                  className="truncate text-xs text-muted-foreground/60"
                  style={{
                    fontFamily:
                      "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Courier New', monospace",
                  }}
                >
                  {shareUrl}
                </p>
              </div>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

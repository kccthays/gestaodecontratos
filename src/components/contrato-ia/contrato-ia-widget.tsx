"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContractsStore } from "@/store/use-contracts-store";
import { PERGUNTAS_SUGERIDAS, responderPergunta, type IAResposta } from "@/lib/contrato-ia";
import { cn } from "@/lib/utils";

interface Mensagem {
  id: string;
  role: "user" | "assistant";
  texto: string;
  contratos?: IAResposta["contratos"];
}

export function ContratoIAWidget() {
  const [open, setOpen] = useState(false);
  const [digitando, setDigitando] = useState(false);
  const [input, setInput] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: "welcome",
      role: "assistant",
      texto:
        "Olá! Sou o Contrato IA. Posso responder perguntas sobre prazos, penalidades, gargalos e prorrogações. O que deseja saber?",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  const contratos = useContractsStore((s) => s.contratos);
  const penalidades = useContractsStore((s) => s.penalidades);
  const streakDesde = useContractsStore((s) => s.streakDesde);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensagens, digitando]);

  function enviar(pergunta: string) {
    const texto = pergunta.trim();
    if (!texto) return;
    idCounter.current += 1;
    const userMsg: Mensagem = { id: `u-${idCounter.current}`, role: "user", texto };
    setMensagens((m) => [...m, userMsg]);
    setInput("");
    setDigitando(true);

    setTimeout(() => {
      idCounter.current += 1;
      const resposta = responderPergunta(texto, { contratos, penalidades, streakDesde });
      setMensagens((m) => [
        ...m,
        { id: `a-${idCounter.current}`, role: "assistant", texto: resposta.texto, contratos: resposta.contratos },
      ]);
      setDigitando(false);
    }, 700);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass-strong fixed bottom-24 right-4 z-50 flex h-[min(600px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl shadow-2xl sm:right-6"
          >
            <div className="flex items-center gap-3 border-b border-border/70 bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3.5 text-white">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/15">
                <Bot className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Contrato IA</p>
                <p className="flex items-center gap-1 text-[11px] text-blue-100">
                  <span className="size-1.5 rounded-full bg-emerald-300" /> Online · dados em tempo real
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex size-7 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white"
                aria-label="Fechar assistente"
              >
                <X className="size-4" />
              </button>
            </div>

            <ScrollArea className="flex-1" viewportClassName="p-4">
              <div ref={scrollRef} className="flex flex-col gap-3">
                {mensagens.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex flex-col gap-1.5", m.role === "user" ? "items-end" : "items-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                        m.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                      )}
                    >
                      {m.texto}
                    </div>
                    {m.contratos && m.contratos.length > 0 && (
                      <div className="flex w-full max-w-[88%] flex-col gap-1.5">
                        {m.contratos.slice(0, 4).map((c) => (
                          <button
                            key={c.id}
                            onClick={() => abrirPainelContrato(c.id)}
                            className="card-surface flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-transform hover:-translate-y-0.5"
                          >
                            <FileText className="size-3.5 shrink-0 text-primary" />
                            <span className="truncate font-medium">{c.numero}</span>
                            <span className="truncate text-muted-foreground">{c.empresa}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
                {digitando && (
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="size-1.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            {mensagens.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 border-t border-border/70 px-3 py-2.5">
                {PERGUNTAS_SUGERIDAS.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => enviar(q)}
                    className="rounded-full border border-border bg-accent/40 px-2.5 py-1 text-[11px] text-foreground/80 transition-colors hover:bg-accent"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar(input);
              }}
              className="flex items-end gap-2 border-t border-border/70 p-3"
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviar(input);
                  }
                }}
                placeholder="Pergunte sobre contratos, prazos, penalidades…"
                className="min-h-9 flex-1 resize-none py-2 text-sm"
                rows={1}
              />
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-4 z-50 flex h-14 items-center gap-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 pl-4 pr-5 text-white shadow-2xl shadow-blue-900/30 sm:right-6"
        aria-label="Abrir Contrato IA"
      >
        <span className="relative flex size-7 items-center justify-center">
          <Sparkles className="size-5" />
          <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
        </span>
        <span className="hidden text-sm font-semibold sm:inline">{open ? "Fechar" : "Contrato IA"}</span>
      </motion.button>
    </>
  );
}

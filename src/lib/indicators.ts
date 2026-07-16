import { addMonths, format, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Contract } from "@/types";
import { isConcluido } from "@/lib/calculations";

export function contratosPorAno(contratos: Contract[]) {
  const map = new Map<number, number>();
  contratos.forEach((c) => map.set(c.anoExercicio, (map.get(c.anoExercicio) ?? 0) + 1));
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([ano, quantidade]) => ({ ano: String(ano), quantidade }));
}

export function contratosPorEmpresa(contratos: Contract[], top = 8) {
  const map = new Map<string, number>();
  contratos.forEach((c) => map.set(c.empresa, (map.get(c.empresa) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([empresa, quantidade]) => ({ nome: empresa.replace(/\s?Ltda\.?$/, ""), quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, top);
}

export function contratosPorFiscal(contratos: Contract[], top = 8) {
  const map = new Map<string, number>();
  contratos.forEach((c) => map.set(c.fiscal, (map.get(c.fiscal) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([fiscal, quantidade]) => ({ nome: fiscal, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, top);
}

export function mapaTemporalVencimentos(contratos: Contract[], hoje: Date, meses = 12) {
  const inicio = startOfMonth(hoje);
  const buckets = Array.from({ length: meses }).map((_, i) => {
    const mesRef = addMonths(inicio, i);
    return { mes: format(mesRef, "MMM/yy", { locale: ptBR }), ref: mesRef, quantidade: 0 };
  });

  contratos.forEach((c) => {
    const termino = parseISO(c.dataTermino);
    const idx = buckets.findIndex(
      (b) => b.ref.getFullYear() === termino.getFullYear() && b.ref.getMonth() === termino.getMonth()
    );
    if (idx >= 0) buckets[idx].quantidade += 1;
  });

  return buckets.map((b) => ({ mes: b.mes, quantidade: b.quantidade }));
}

export function prorrogacoesConcluidasStats(contratos: Contract[]) {
  const concluidos = contratos.filter(isConcluido).length;
  const total = contratos.length;
  const percentual = total > 0 ? Math.round((concluidos / total) * 100) : 0;
  return { concluidos, pendentes: total - concluidos, total, percentual };
}

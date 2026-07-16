# SIGC — Sistema Inteligente de Gestão de Contratos

Dashboard institucional para acompanhamento de prorrogações contratuais, penalidades administrativas e fluxo de processos, com o **Mapa Inteligente do Fluxo Contratual** como diferencial: visualização em tempo real de cada contrato desde o planejamento até a nova vigência, com identificação automática de gargalos.

## Stack

React 19 · Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion · Recharts · Lucide React · TanStack Table · TanStack Query · Zustand · date-fns · SheetJS (xlsx)

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Dados

O sistema inicia com um conjunto de dados de exemplo (58 contratos, penalidades e eventos), gerado de forma determinística em `src/lib/mock-data.ts`. Todos os indicadores — dias restantes, faixas de antecedência, streak sem Zona Crítica, gargalos, etc. — são calculados a partir desses dados em `src/lib/calculations.ts` e `src/lib/flow-calculations.ts`.

Planilhas Excel (.xlsx) podem ser importadas em **Configurações → Integração de Dados**: o arquivo é processado no navegador (`src/lib/excel-import.ts`), uma pré-visualização é exibida para validação e, ao confirmar, todos os indicadores do sistema são recalculados automaticamente.

## Estrutura

- `src/app/(dashboard)` — páginas (Dashboard, Mapa de Fluxo, Contratos, Prorrogações, Penalidades, Indicadores, Cronograma, Relatórios, Processos SEI, Configurações)
- `src/components/dashboard` — componentes das quatro áreas do dashboard principal
- `src/components/flow` — Mapa Inteligente do Fluxo Contratual (Fluxograma, Rede Inteligente, gargalos, análise de IA)
- `src/components/contrato-ia` — assistente conversacional local (respostas geradas a partir dos dados em memória, sem chamadas externas)
- `src/store` — estado global (Zustand)
- `src/lib` — cálculos, geração de dados de exemplo e importação de planilhas

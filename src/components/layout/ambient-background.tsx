"use client";

import { useId } from "react";

const NODES = [
  { x: 6, y: 18 },
  { x: 22, y: 8 },
  { x: 40, y: 22 },
  { x: 60, y: 10 },
  { x: 78, y: 24 },
  { x: 94, y: 14 },
  { x: 14, y: 62 },
  { x: 34, y: 78 },
  { x: 58, y: 68 },
  { x: 82, y: 82 },
  { x: 96, y: 60 },
];

const LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [0, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [2, 8],
];

export function AmbientBackground() {
  const gradientId = useId();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg className="h-full w-full opacity-[0.35] dark:opacity-[0.22]" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--blue-400)" />
            <stop offset="100%" stopColor="var(--blue-600)" />
          </linearGradient>
        </defs>
        {LINES.map(([a, b], i) => {
          const from = NODES[a];
          const to = NODES[b];
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={`url(#${gradientId})`}
              strokeWidth="0.12"
              strokeDasharray="1.2 1.6"
              className="animate-dash"
              style={{ animationDelay: `${i * 0.3}s`, animationDuration: `${6 + (i % 4)}s` }}
            />
          );
        })}
        {NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r="0.45"
            fill="var(--blue-400)"
            className="animate-pulse-soft"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </svg>

      <div className="animate-float-slow absolute -left-24 top-[8%] size-72 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-500/10" />
      <div
        className="animate-float-slow absolute right-[-10%] top-[35%] size-96 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-400/10"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="animate-float-slow absolute bottom-[-15%] left-[30%] size-80 rounded-full bg-blue-100/40 blur-3xl dark:bg-blue-600/10"
        style={{ animationDelay: "3s" }}
      />
    </div>
  );
}

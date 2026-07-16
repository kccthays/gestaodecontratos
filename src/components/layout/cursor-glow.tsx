"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
      if (frame.current == null) {
        frame.current = requestAnimationFrame(() => {
          if (ref.current) {
            ref.current.style.transform = `translate(${pos.current.x - 240}px, ${pos.current.y - 240}px)`;
          }
          frame.current = null;
        });
      }
    }
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 -z-10 hidden size-[480px] rounded-full opacity-0 transition-opacity duration-500 will-change-transform md:block"
      style={{
        background:
          "radial-gradient(circle, rgba(75,139,240,0.10) 0%, rgba(75,139,240,0.04) 45%, transparent 70%)",
        animation: "fade-in 1.2s ease forwards",
      }}
    />
  );
}

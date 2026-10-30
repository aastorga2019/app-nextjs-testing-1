"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { type Participant } from "@/lib/wheel";

interface WheelProps {
  participants: Participant[];
  rotation: number;
  isSpinning: boolean;
  onSpin: () => void;
}

export function Wheel({
  participants,
  rotation,
  isSpinning,
  onSpin,
}: WheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [outerRadius, setOuterRadius] = useState(140);
  const [pointerAngle, setPointerAngle] = useState(0);

  const transformStyle = useMemo(() => `rotate(${rotation}deg)`, [rotation]);

  useEffect(() => {
    const segmentCount = participants.length || 1;
    const segmentAngle = 360 / segmentCount;
    const norm = ((rotation % 360) + 360) % 360;
    const pointerLocal = (270 - norm + 360) % 360;
    setPointerAngle((pointerLocal + 360) % 360);
  }, [rotation, participants.length]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      setOuterRadius(Math.max(80, (size - 36) / 2));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const colors = useMemo(() => {
    const palette = [
      "#f97316", "#f59e0b", "#eab308", "#22c55e", "#10b981",
      "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
      "#d946ef", "#ec4899", "#f43f5e", "#fb923c", "#84cc16",
    ];
    return participants.map((_, i) => palette[i % palette.length]);
  }, [participants.length]);

  const segmentAngle = participants.length ? 360 / participants.length : 0;

  const segments = useMemo(() => {
    return participants.map((p, i) => ({
      id: `seg-${p.id}`,
      participantId: p.id,
      start: i * segmentAngle,
      end: (i + 1) * segmentAngle,
      span: segmentAngle,
      color: colors[i],
    }));
  }, [participants, segmentAngle, colors]);

  const winnerSegment = useMemo(() => {
    if (!participants.length) return null;
    const norm = ((rotation % 360) + 360) % 360;
    const pointerLocal = (270 - norm + 360) % 360;
    const idx = Math.floor((pointerLocal + segmentAngle / 2) / segmentAngle) % participants.length;
    return segments[idx] ?? null;
  }, [rotation, participants.length, segments, segmentAngle]);

  const handleSpin = useCallback(() => {
    onSpin();
  }, [onSpin]);

  return (
    <div className="flex flex-col items-center">
      <div className={`relative overflow-hidden ${isSpinning ? "wheel-spinning" : ""}`}>
        <svg
          ref={svgRef}
          className="wheel-size block drop-shadow-2xl"
          viewBox="-160 -160 320 320"
          style={{ transform: transformStyle, transformOrigin: "center" }}
        >
          {segments.map((seg) => {
            const startAngle = (seg.start * Math.PI) / 180;
            const endAngle = (seg.end * Math.PI) / 180;
            const largeArc = seg.span > 180 ? 1 : 0;
            const toPt = (a: number, r: number) => {
              const x = r * Math.cos(a);
              const y = r * Math.sin(a);
              return `${x},${y}`;
            };
            const d = `M 0,0 L ${toPt(startAngle, outerRadius)} A ${outerRadius},${outerRadius} 0 ${largeArc} 1 ${toPt(endAngle, outerRadius)} Z`;
            return (
              <path
                key={seg.id}
                d={d}
                fill={seg.color}
                stroke="#0f0f0f"
                strokeWidth={1.5}
                data-participant={seg.participantId}
              />
            );
          })}
          <circle cx="0" cy="0" r={outerRadius * 0.92} fill="none" stroke="#0f0f0f" strokeWidth={1} />
          <circle cx="0" cy="0" r={outerRadius / 3.5} fill="#1a1a1a" stroke="#0f0f0f" strokeWidth={2} />
          <text
            x="0" y="-2" textAnchor="middle" fontSize={11} fill="#fff" fontWeight={800}
            fontFamily="var(--font-geist-sans), Arial, sans-serif" letterSpacing="0.05em"
          >
            {participants.length}
            <tspan fontSize={7} dy="1.3em" fill="#a1a1aa">participantes</tspan>
          </text>
          {winnerSegment ? (
            <g transform={`rotate(${pointerAngle} 0 0)`} className="winner-ribbon">
              <rect x={-20} y={-outerRadius - 10} width={42} height={16} rx={8} fill="#fbbf24" stroke="#0f0f0f" strokeWidth={1.5} />
              <text x={0} y={-outerRadius + 3} textAnchor="middle" fontSize={8} fill="#0f0f0f" fontWeight={800} fontFamily="var(--font-geist-sans), Arial, sans-serif">GANADOR</text>
            </g>
          ) : null}
        </svg>
        <div className="absolute -top-8 -left-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-t-[22px] border-t-[#f59e0b] border-l-transparent border-r-transparent pointer-events-none z-10" style={{ transform: `rotate(${pointerAngle}deg)`, transformOrigin: "top" }} />
        <div className="wheel-glow absolute inset-0 rounded-full" />
      </div>
      <button
        type="button"
        onClick={handleSpin}
        disabled={isSpinning}
        aria-label="Rodar la ruleta"
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-500 px-9 py-3.5 font-semibold text-black shadow-lg transition-all hover:bg-amber-400 hover:shadow-[0_0_24px_rgba(245,158,11,0.5)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-amber-500 disabled:hover:shadow-none"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        ROTAR
      </button>
    </div>
  );
}
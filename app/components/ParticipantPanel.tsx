"use client";

import { useMemo, useState } from "react";
import { DEFAULT_PARTICIPANTS, type Participant } from "@/lib/wheel";

interface ParticipantPanelProps {
  participants: Participant[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  isSpinning: boolean;
  disabled?: boolean;
}

export function ParticipantPanel({
  participants,
  onAdd,
  onRemove,
  onReset,
  isSpinning,
  disabled,
}: ParticipantPanelProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const safeParticipants = participants.length ? participants : DEFAULT_PARTICIPANTS;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Ingresa un nombre para el participante.");
      return;
    }
    if (safeParticipants.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("Ese participante ya está en la lista.");
      return;
    }
    onAdd(trimmed);
    setName("");
    setError(null);
  };

  const canAdd = !isSpinning && !disabled;

  return (
    <aside className="panel w-full max-w-xs flex-1 rounded-2xl border border-white/10 bg-black/20 p-4 shadow-2xl backdrop-blur-md sm:max-w-sm">
      <h1 className="panel-title text-white">Participantes</h1>

      <form className="form" onSubmit={handleAdd} noValidate>
        <input
          className="form-input"
          placeholder="Nombre del participante..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          disabled={isSpinning || disabled}
          aria-label="Nombre del participante"
        />
        {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={!name.trim() || isSpinning || disabled}
          className="rounded-xl bg-white px-4 py-2 font-semibold text-black transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Agregar
        </button>
      </form>

      <div className="scrollbar-thin max-h-[260px] overflow-y-auto pr-1">
        {safeParticipants.length === 0 ? (
          <p className="text-sm text-stone-400">No hay participantes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {safeParticipants.map((p) => (
              <li key={p.id} className="participant-item">
                <span className="participant-mark" style={{ background: colorForIndex(p.id, safeParticipants.length) }} />
                <span className="participant-name text-white">{p.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  disabled={isSpinning || disabled}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                  aria-label={`Eliminar ${p.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={isSpinning || disabled || participants.length <= 1}
          className="flex-1 rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-stone-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reiniciar
        </button>
      </div>
    </aside>
  );
}

function colorForIndex(index: string, total: number): string {
  // Deterministic palette when the winner modal needs a highlight color.
  const palette = [
    "#f97316", "#f59e0b", "#eab308", "#22c55e", "#10b981",
    "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
    "#d946ef", "#ec4899", "#f43f5e", "#fb923c", "#84cc16",
  ];
  const idx = (Number(index.slice(1)) || 0) % palette.length;
  return palette[idx];
}

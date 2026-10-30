"use client";

import { useEffect, useState } from "react";
import { type Participant } from "@/lib/wheel";

interface AwardModalProps {
  isOpen: boolean;
  winner: Participant | null;
  onClose: () => void;
  onRedo: () => void;
}

export function AwardModal({ isOpen, winner, onClose, onRedo }: AwardModalProps) {
  const [celebration, setCelebration] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCelebration(true);
      const t = setTimeout(() => setCelebration(false), 1200);
      return () => clearTimeout(t);
    } else {
      setCelebration(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ganador"
    >
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDelay: "0.05s" }}
      >
        <div
          className="emoji"
          style={{ transform: celebration ? "scale(1.35) rotate(-8deg)" : "scale(1)" }}
        >
          🎉
        </div>
        {winner ? (
          <>
            <div className="name">¡Felicidades, {winner.name}!</div>
            <div className="label">Has levantado el premio de la lotería.</div>
            <button
              type="button"
              onClick={onRedo}
              className="mt-6 rounded-xl bg-[#f59e0b] px-5 py-2.5 font-semibold text-black transition hover:bg-[#d97706]"
            >
              ¡Otra vez!
            </button>
          </>
        ) : (
          <>
            <div className="emoji">🎲</div>
            <div className="label">No hay ganador todavía.</div>
          </>
        )}
      </div>
    </div>
  );
}

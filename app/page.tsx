"use client";

import { useState } from "react";
import { Wheel } from "@/components/Wheel";
import { ParticipantPanel } from "@/components/ParticipantPanel";
import { AwardModal } from "@/components/AwardModal";
import { useWheelAnimation } from "@/hooks/useWheelAnimation";
import { DEFAULT_PARTICIPANTS, type Participant } from "@/lib/wheel";

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>(DEFAULT_PARTICIPANTS);
  const [winner, setWinner] = useState<Participant | null>(null);

  const { rotation, isSpinning, spin, reset } = useWheelAnimation(participants);

  const handleSpin = () => spin();

  const handleAdd = (name: string) => {
    setParticipants((prev) => [
      ...prev,
      { id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, name },
    ]);
  };

  const handleRemove = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReset = () => {
    setParticipants(DEFAULT_PARTICIPANTS);
    reset();
    setWinner(null);
  };

  return (
    <main className="flex flex-col items-center justify-center bg-black px-4 py-12 min-h-[100vh]">
      <h1 className="text-4xl font-black text-white tracking-tight sm:text-5xl mb-2">
        Ruleta de Sorteos
      </h1>
      <p className="text-stone-400 max-w-md text-sm sm:text-base text-center mb-10">
        Agrega participantes, haz clic en{" "}
        <span className="text-amber-400 font-semibold">ROTAR</span> y descubre al
        ganador.
      </p>

      <div className="w-full max-w-6xl grid gap-8 sm:grid-cols-[1fr_360px] items-center">
        <div className="flex flex-col items-center justify-center min-w-0">
          <Wheel
            participants={participants}
            rotation={rotation}
            isSpinning={isSpinning}
            onSpin={handleSpin}
          />
        </div>

        <ParticipantPanel
          participants={participants}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onReset={handleReset}
          isSpinning={isSpinning}
        />
      </div>

      {participants.length > 0 && (
        <section className="mt-10 w-full max-w-4xl scoreboard">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-4">
            Participantes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {participants.map((p) => (
              <div key={p.id} className="score-card">
                <div className="name text-white">{p.name}</div>
                <div className="badge bg-stone-700 text-xs">
                  #{participants.indexOf(p) + 1}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <AwardModal
        isOpen={!!winner}
        winner={winner}
        onClose={() => setWinner(null)}
        onRedo={handleSpin}
      />
    </main>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Participant } from "@/lib/wheel";

/**
 * Wheel animation hook.
 *
 * - `rotation`: total degrees applied to the wheel transform (animated by CSS).
 * - `isSpinning`: true while the wheel is in motion; gates the spin button.
 * - `winner`: resolved participant once the animation finishes.
 * - `spin()`: picks a random participant and starts a ~5s smooth rotation
 *   that is guaranteed to stop exactly on the chosen segment.
 * - `reset()`: clears rotation, winner and spinning state.
 */
export function useWheelAnimation(participants: Participant[]) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);

  // Last final (normalised) rotation, so each new spin always adds several
  // full turns on top of the current position for a consistent visual.
  const baseRotationRef = useRef(0);

  const safeParticipants = useMemo(
    () => participants.filter(Boolean),
    [participants],
  );

  const spin = useCallback(() => {
    if (isSpinning || !safeParticipants.length) return;

    const segmentCount = safeParticipants.length;
    const segmentAngle = 360 / segmentCount;

    // Pick a random winner index.
    const winnerIndex = Math.floor(Math.random() * segmentCount);

    // Target rotation:
    //   SVG 0° points right; the pointer sits at the top (270°).
    //   Segment i's centre in local coords is (i + 0.5) * segmentAngle.
    //   After rotating R° clockwise: centre ≡ 270° (mod 360).
    //   R = 270 - (i + 0.5) * segmentAngle + 360 * k
    //   With k = 6 (six full turns) → R = 2430 - (i + 0.5) * segmentAngle.
    const offset = 2430 - (winnerIndex + 0.5) * segmentAngle;
    const targetRotation = baseRotationRef.current + offset;

    // Normalise for the next spin so the base never grows unbounded.
    baseRotationRef.current = targetRotation % 360;

    setWinner(null);
    setIsSpinning(true);
    // CSS transition animates from the current committed value to targetRotation.
    setRotation(targetRotation);
  }, [isSpinning, safeParticipants.length]);

  // Resolve the winner once the ~5s animation finishes.
  useEffect(() => {
    if (!isSpinning) return;

    const timer = setTimeout(() => {
      const segmentCount = safeParticipants.length;
      const segmentAngle = 360 / segmentCount;
      const norm = ((rotation % 360) + 360) % 360;

      // Which segment centre ends up at the top pointer (270°)?
      // norm ≡ 270 - (i + 0.5) * segmentAngle (mod 360)
      // → i ≡ (270 - norm - segmentAngle / 2) / segmentAngle
      const rawIndex = (270 - norm - segmentAngle / 2) / segmentAngle;
      const winnerIndex =
        ((Math.round(rawIndex) % segmentCount) + segmentCount) % segmentCount;

      setWinner(safeParticipants[winnerIndex] ?? null);
      setIsSpinning(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isSpinning, rotation, safeParticipants]);

  const reset = useCallback(() => {
    setRotation(0);
    setWinner(null);
    setIsSpinning(false);
    baseRotationRef.current = 0;
  }, []);

  return { rotation, isSpinning, winner, spin, reset };
}

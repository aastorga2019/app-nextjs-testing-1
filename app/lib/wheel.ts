export type { Participant, WheelSegment, WheelStop } from "./types";
import type { Participant, WheelSegment, WheelStop } from "./types";

/** Default participants so the wheel is never empty on first load. */
export const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: "p1", name: "Ana López" },
  { id: "p2", name: "Bruno Ruiz" },
  { id: "p3", name: "Carlos Gutiérrez" },
  { id: "p4", name: "Diana Rojas" },
  { id: "p5", name: "Elena Martínez" },
];

/** Create the initial, non-spinning segment list. */
export function createInitialWheelSegments(
  participants: Participant[],
  totalAngle: number,
): WheelSegment[] {
  if (!participants.length) return [];
  const perSegment = totalAngle / participants.length;
  return participants.map((p, i) => ({
    id: `seg-${p.id}`,
    participantId: p.id,
    start: i * perSegment,
    end: (i + 1) * perSegment,
    span: perSegment,
    color: colorForIndex(i, participants.length),
  }));
}

/** Generate a deterministic but varied color per participant index. */
function colorForIndex(index: number, total: number): string {
  const hue = ((index * 137.508) % total + 0) * (360 / total);
  // Convert hue to a pleasing, well-distributed color.
  const h = ((index * 137.508) % 360 + 360) % 360;
  const sat = 70 + ((index * 3) % 21);
  const light = 55 + ((index * 5) % 13);
  return `hsl(${h}, ${sat}%, ${light}%)`;
}

/**
 * Compute a full 5-second spin that ends on a random participant.
 * Returns one or more stops; each stop ends exactly on a segment boundary.
 * The rotation always lands on a participant (never somewhere in-between).
 */
export function spinToStop(participants: Participant[]): WheelStop[] {
  if (!participants.length) {
    return [{ angle: 0, duration: 0 }];
  }

  const segmentCount = participants.length;
  const perSegment = 360 / segmentCount;

  // A "nice" full rotation: multiple of 360.
  const fullRotations = Math.round(5 / 5) * 360; // 360
  // Add a random multiple of segments so the winner is uniform.
  const randomSegments = Math.floor(Math.random() * segmentCount);
  const randomAngle = randomSegments * perSegment;

  const totalAngle = fullRotations + randomAngle;
  const duration = 5000;

  return [{ angle: totalAngle, duration }];
}

/** Unique id helper. */
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

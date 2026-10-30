export interface Participant {
  id: string;
  name: string;
}

export interface WheelStop {
  /** Total degrees the wheel rotates before stopping. */
  angle: number;
  /** Animation duration in ms (set to 5000 for the requested 5s spin). */
  duration: number;
}

export interface WheelSegment {
  id: string;
  participantId: string;
  start: number; // degrees (0 = right, clockwise)
  end: number;
  span: number;
  color: string;
}

export interface Node {
  id: string;
  type: string;
  icon: string; // Emoji
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fillColor: string;
  textColor: string;
  shape: 'rect' | 'circle' | 'diamond' | 'cylinder' | 'cloud' | 'user';
  note?: string;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
}

export interface Stroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  pathD?: string; // Pre-computed smooth SVG path
}

export interface BoardState {
  nodes: Node[];
  connections: Connection[];
  strokes?: Stroke[];
}

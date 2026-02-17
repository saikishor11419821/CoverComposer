
export enum Genre {
  EDM = 'EDM',
  LOFI = 'Lo-fi',
  CLASSICAL = 'Classical',
  POP = 'Pop',
  ROCK = 'Rock',
  JAZZ = 'Jazz',
  CINEMATIC = 'Cinematic'
}

export enum Mood {
  HAPPY = 'Happy',
  SAD = 'Sad',
  CHILL = 'Chill',
  DARK = 'Dark',
  ENERGETIC = 'Energetic',
  DREAMY = 'Dreamy'
}

export interface Note {
  note: string;     // e.g., "C4", "Eb3"
  time: string;     // Tone.js notation "bar:beat:sixteenth" e.g., "0:1:2"
  duration: string; // Tone.js notation "4n", "8n", "2n"
}

export interface DrumHit {
  type: 'kick' | 'snare' | 'hihat';
  time: string;     // Tone.js notation
}

export interface Section {
  section: string;
  bars: number;
  chords: string[]; // Progression per bar
  melody: Note[];
  drums: DrumHit[];
  bass: Note[];
}

export interface Composition {
  genre: Genre;
  mood: Mood;
  tempo: number;
  key: string;
  structure: Section[];
  fullChordProgression: string;
  melodyNotation: string;
  drumPatternBreakdown: string;
  instrumentSuggestions: string[];
  lyrics?: string;
  reasoning: string;
  productionTips: string;
}

export interface CompositionRequest {
  genre: Genre;
  mood: Mood;
  tempo: number;
  includeLyrics: boolean;
  durationSeconds: number;
}

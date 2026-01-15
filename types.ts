export interface BrainrotConcept {
  name: string;
  lore: string;
  visualPrompt: string;
}

export interface BrainrotEntry extends BrainrotConcept {
  id: string;
  imageUrl: string;
  timestamp: number;
}

export interface BrainrotState {
  entries: BrainrotEntry[];
  isLoading: boolean;
  error: string | null;
}
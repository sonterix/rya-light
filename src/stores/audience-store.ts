import { create } from 'zustand';

interface AudienceState {
  selectedAudienceId: string | null;
  setSelectedAudienceId: (id: string) => void;
  clearSelectedAudienceId: () => void;
}

export const useAudienceStore = create<AudienceState>((set) => ({
  selectedAudienceId: null,
  setSelectedAudienceId: (id: string) => set({ selectedAudienceId: id }),
  clearSelectedAudienceId: () => set({ selectedAudienceId: null }),
}));

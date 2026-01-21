import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  x?: number; // Screen coords (if needed)
  y?: number;
}

interface FloatingTextState {
  texts: FloatingText[];
  addText: (text: string, color?: string) => void;
  removeText: (id: string) => void;
}

export const useFloatingTextStore = create<FloatingTextState>((set) => ({
  texts: [],
  addText: (text, color = '#F8FAFC') => {
    const id = uuidv4();
    set((state) => ({ texts: [...state.texts, { id, text, color }] }));
    
    // Auto remove after animation
    setTimeout(() => {
        set((state) => ({ texts: state.texts.filter((t) => t.id !== id) }));
    }, 2000);
  },
  removeText: (id) => set((state) => ({ texts: state.texts.filter((t) => t.id !== id) })),
}));

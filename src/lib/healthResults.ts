export type HealthResultType = 'face' | 'pose' | 'hand' | 'bmi';

export interface HealthResultEntry {
  id: string;
  type: HealthResultType;
  timestamp: string;
  data: {
    confidence?: number;
    emotion?: string;
    repCount?: number;
    formScore?: number;
    gesture?: string;
    exerciseType?: string;
    duration?: number;
    bmi?: number;
    category?: string;
    weight?: number;
    height?: number;
  };
}

const STORAGE_KEY = 'health-results';

export const appendHealthResult = (entry: HealthResultEntry) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: HealthResultEntry[] = raw ? JSON.parse(raw) : [];
    const next = [entry, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Failed to append health result:', error);
  }
};

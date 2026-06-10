export type HealthResultType = 'face' | 'pose' | 'hand' | 'bmi' | 'vitals' | 'disease' | 'device';

export interface HealthResultEntry {
  id: string;
  type: HealthResultType;
  timestamp: string;
  data: {
    label?: string;
    score?: number;
    note?: string;
    kind?: string;
    // vitals values (when type === 'vitals')
    vitals?: any;
    // convenience short maps
    heartRate?: number;
    respiratoryRate?: number;
    hrv?: number;
    [key: string]: any;
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
    // Ensure an id exists
    if (!entry.id) {
      try {
        // use crypto API when available
        // @ts-ignore
        entry.id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `hr-${Date.now()}`;
      } catch {
        entry.id = `hr-${Date.now()}`;
      }
    }
    const next = [entry, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Failed to append health result:', error);
  }
};

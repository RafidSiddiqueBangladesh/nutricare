export interface FoodLog {
  id: string;
  name: string;
  calories: number;
  amount: string;
  timestamp: number;
}

export interface ExerciseLog {
  id: string;
  type: 'Push-ups' | 'Squats' | 'Jumping Jacks';
  reps: number;
  score: number;
  timestamp: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  expiryDate: string;
  amountOption: string;
  addedAt: number;
}

export interface CostEntry {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface HealthMetric {
  id: string;
  type: 'bmi' | 'mood';
  value: any;
  timestamp: number;
}

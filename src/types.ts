export type CapacityMode = 'survival' | 'maintenance' | 'growth';

export interface CapacityLog {
  id?: string;
  userId: string;
  date: string;
  capacityLevel: number; // 0 to 100
  mode: CapacityMode;
  notes?: string;
  createdAt: string;
}

export interface ImperfectionChallenge {
  id: string;
  tier: 1 | 2 | 3;
  title: string;
  description: string;
  rationale: string;
  promptExample?: string;
}

export interface ImperfectionReflection {
  id?: string;
  userId: string;
  challengeId: string;
  tier: number;
  title: string;
  reflection?: string;
  didWorldEnd: boolean;
  feeling?: string;
  createdAt: string;
}

export interface BoundaryScript {
  id: string;
  category: 'work' | 'social' | 'personal' | 'time';
  title: string;
  situation: string;
  script: string;
  explanation: string;
}

export interface BoundaryLog {
  id?: string;
  userId: string;
  category: string;
  situation: string;
  scriptUsed?: string;
  reflection?: string;
  createdAt: string;
}

export interface DoneEntry {
  id?: string;
  userId: string;
  text: string;
  category: 'care' | 'work' | 'rest' | 'survival';
  createdAt: string;
}

export interface GoodEnoughEntry {
  id?: string;
  userId: string;
  taskName: string;
  whyEnough: string;
  createdAt: string;
}

export interface BurnoutQuestion {
  id: number;
  question: string;
  dimension: 'exhaustion' | 'detachment' | 'inefficacy';
  options: { label: string; score: number }[];
}

export interface BurnoutResult {
  score: number;
  exhaustionScore: number;
  detachmentScore: number;
  inefficacyScore: number;
  message: string;
  permissionNote: string;
}

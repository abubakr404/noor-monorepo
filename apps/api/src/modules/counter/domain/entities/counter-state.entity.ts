export interface CounterStateEntity {
  id: string;
  userId: string;
  current: number;
  target: number;
  presetId: string | null;
  customLabel: string | null;
}

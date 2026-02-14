export interface DailyProgressEntity {
  id: string;
  userId: string;
  date: string;
  category: string;
  completedIds: string;
  inProgress: string;
  createdAt: Date;
  updatedAt: Date;
}

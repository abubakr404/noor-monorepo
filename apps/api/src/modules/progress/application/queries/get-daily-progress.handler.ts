import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetDailyProgressQuery } from "./get-daily-progress.query";
import { ProgressDataService } from "../services/progress-data.service";

interface ParsedDailyProgress {
  id: string;
  userId: string;
  date: string;
  category: string;
  completedIds: number[];
  inProgress: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetDailyProgressQuery)
export class GetDailyProgressHandler implements IQueryHandler<GetDailyProgressQuery> {
  constructor(private readonly progressData: ProgressDataService) {}

  async execute(query: GetDailyProgressQuery): Promise<ParsedDailyProgress[]> {
    const rows = await this.progressData.getByDateAndUser(query.userId, query.date);

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      date: row.date,
      category: row.category,
      completedIds: JSON.parse(row.completedIds) as number[],
      inProgress: JSON.parse(row.inProgress) as Record<string, number>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }
}

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetStreakQuery } from "./get-streak.query";
import { ProgressDataService } from "../services/progress-data.service";
import type { StreakEntity } from "../../domain/entities/streak.entity";

@QueryHandler(GetStreakQuery)
export class GetStreakHandler implements IQueryHandler<GetStreakQuery> {
  constructor(private readonly progressData: ProgressDataService) {}

  async execute(query: GetStreakQuery): Promise<StreakEntity> {
    const streak = await this.progressData.getStreak(query.userId);
    return streak ?? { id: "", userId: query.userId, count: 0, lastDate: "" };
  }
}

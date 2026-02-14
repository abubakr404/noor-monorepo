import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpsertProgressCommand } from "./upsert-progress.command";
import { ProgressDataService } from "../services/progress-data.service";
import type { DailyProgressEntity } from "../../domain/entities/daily-progress.entity";
import type { StreakEntity } from "../../domain/entities/streak.entity";

@CommandHandler(UpsertProgressCommand)
export class UpsertProgressHandler implements ICommandHandler<UpsertProgressCommand> {
  constructor(private readonly progressData: ProgressDataService) {}

  async execute(
    command: UpsertProgressCommand,
  ): Promise<{ progress: DailyProgressEntity; streak: StreakEntity }> {
    const progress = await this.progressData.upsertProgress(
      command.userId,
      command.date,
      command.category,
      command.completedIds,
      command.inProgress,
    );

    const streak = await this.progressData.updateStreak(command.userId, command.date);

    return { progress, streak };
  }
}

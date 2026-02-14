import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ProgressController } from "./presentation/progress.controller";
import { ProgressDataService } from "./application/services/progress-data.service";
import { ProgressRepository } from "./infrastructure/repositories/progress.repository";
import { PROGRESS_REPOSITORY } from "./domain/interfaces/progress-repository.token";
import { UpsertProgressHandler } from "./application/commands/upsert-progress.handler";
import { GetDailyProgressHandler } from "./application/queries/get-daily-progress.handler";
import { GetStreakHandler } from "./application/queries/get-streak.handler";

const CommandHandlers = [UpsertProgressHandler];
const QueryHandlers = [GetDailyProgressHandler, GetStreakHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ProgressController],
  providers: [
    ProgressRepository,
    { provide: PROGRESS_REPOSITORY, useExisting: ProgressRepository },
    ProgressDataService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ProgressDataService],
})
export class ProgressModule {}

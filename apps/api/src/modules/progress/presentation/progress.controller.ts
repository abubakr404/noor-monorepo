import { Controller, Get, Put, Body, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { UpsertProgressDto } from "../application/dto/upsert-progress.dto";
import { UpsertProgressCommand } from "../application/commands/upsert-progress.command";
import { GetDailyProgressQuery } from "../application/queries/get-daily-progress.query";
import { GetStreakQuery } from "../application/queries/get-streak.query";

@Controller("progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getProgress(@CurrentUser() userId: string, @Query("date") date: string) {
    return this.queryBus.execute(new GetDailyProgressQuery(userId, date));
  }

  @Put()
  upsertProgress(@CurrentUser() userId: string, @Body() body: UpsertProgressDto) {
    return this.commandBus.execute(
      new UpsertProgressCommand(userId, body.date, body.category, body.completedIds, body.inProgress),
    );
  }

  @Get("streak")
  getStreak(@CurrentUser() userId: string) {
    return this.queryBus.execute(new GetStreakQuery(userId));
  }
}

import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { SaveCounterDto } from "../application/dto/save-counter.dto";
import { SaveCounterCommand } from "../application/commands/save-counter.command";
import { GetCounterQuery } from "../application/queries/get-counter.query";

@Controller("counter")
@UseGuards(JwtAuthGuard)
export class CounterController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getCounter(@CurrentUser() userId: string) {
    return this.queryBus.execute(new GetCounterQuery(userId));
  }

  @Put()
  saveCounter(@CurrentUser() userId: string, @Body() dto: SaveCounterDto) {
    return this.commandBus.execute(
      new SaveCounterCommand(
        userId,
        dto.current,
        dto.target,
        dto.presetId,
        dto.customLabel,
      ),
    );
  }
}

import { Controller, Get, Patch, Body, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { UpdatePreferencesDto } from "../application/dto/update-preferences.dto";
import { UpdatePreferencesCommand } from "../application/commands/update-preferences.command";
import { GetPreferencesQuery } from "../application/queries/get-preferences.query";

@Controller("preferences")
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getPreferences(@CurrentUser() userId: string) {
    return this.queryBus.execute(new GetPreferencesQuery(userId));
  }

  @Patch()
  updatePreferences(
    @CurrentUser() userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.commandBus.execute(
      new UpdatePreferencesCommand(userId, dto),
    );
  }
}

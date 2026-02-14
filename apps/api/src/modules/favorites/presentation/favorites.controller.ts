import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AddFavoriteCommand } from "../application/commands/add-favorite.command";
import { RemoveFavoriteCommand } from "../application/commands/remove-favorite.command";
import { GetFavoritesQuery } from "../application/queries/get-favorites.query";

@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getFavorites(@CurrentUser() userId: string) {
    return this.queryBus.execute(new GetFavoritesQuery(userId));
  }

  @Post(":zikrId")
  addFavorite(
    @CurrentUser() userId: string,
    @Param("zikrId", ParseIntPipe) zikrId: number,
  ) {
    return this.commandBus.execute(new AddFavoriteCommand(userId, zikrId));
  }

  @Delete(":zikrId")
  removeFavorite(
    @CurrentUser() userId: string,
    @Param("zikrId", ParseIntPipe) zikrId: number,
  ) {
    return this.commandBus.execute(
      new RemoveFavoriteCommand(userId, zikrId),
    );
  }
}

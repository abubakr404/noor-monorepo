import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RemoveFavoriteCommand } from "./remove-favorite.command";
import { FavoritesDataService } from "../services/favorites-data.service";

@CommandHandler(RemoveFavoriteCommand)
export class RemoveFavoriteHandler
  implements ICommandHandler<RemoveFavoriteCommand>
{
  constructor(private readonly favoritesData: FavoritesDataService) {}

  async execute(
    command: RemoveFavoriteCommand,
  ): Promise<{ success: boolean }> {
    await this.favoritesData.removeFavorite(command.userId, command.zikrId);
    return { success: true };
  }
}

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AddFavoriteCommand } from "./add-favorite.command";
import { FavoritesDataService } from "../services/favorites-data.service";

@CommandHandler(AddFavoriteCommand)
export class AddFavoriteHandler
  implements ICommandHandler<AddFavoriteCommand>
{
  constructor(private readonly favoritesData: FavoritesDataService) {}

  async execute(command: AddFavoriteCommand): Promise<{ success: boolean }> {
    await this.favoritesData.addFavorite(command.userId, command.zikrId);
    return { success: true };
  }
}

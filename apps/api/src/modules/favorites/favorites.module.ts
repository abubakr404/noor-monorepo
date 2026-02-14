import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { FavoritesController } from "./presentation/favorites.controller";
import { FavoritesDataService } from "./application/services/favorites-data.service";
import { FavoriteRepository } from "./infrastructure/repositories/favorite.repository";
import { FAVORITE_REPOSITORY } from "./domain/interfaces/favorite-repository.token";
import { AddFavoriteHandler } from "./application/commands/add-favorite.handler";
import { RemoveFavoriteHandler } from "./application/commands/remove-favorite.handler";
import { GetFavoritesHandler } from "./application/queries/get-favorites.handler";

const CommandHandlers = [AddFavoriteHandler, RemoveFavoriteHandler];
const QueryHandlers = [GetFavoritesHandler];

@Module({
  imports: [CqrsModule],
  controllers: [FavoritesController],
  providers: [
    FavoriteRepository,
    { provide: FAVORITE_REPOSITORY, useExisting: FavoriteRepository },
    FavoritesDataService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [FavoritesDataService],
})
export class FavoritesModule {}

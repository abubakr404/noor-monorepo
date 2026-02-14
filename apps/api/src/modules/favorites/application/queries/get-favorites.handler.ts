import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetFavoritesQuery } from "./get-favorites.query";
import { FavoritesDataService } from "../services/favorites-data.service";
import type { FavoriteEntity } from "../../domain/entities/favorite.entity";

@QueryHandler(GetFavoritesQuery)
export class GetFavoritesHandler
  implements IQueryHandler<GetFavoritesQuery>
{
  constructor(private readonly favoritesData: FavoritesDataService) {}

  async execute(query: GetFavoritesQuery): Promise<FavoriteEntity[]> {
    return this.favoritesData.getByUserId(query.userId);
  }
}

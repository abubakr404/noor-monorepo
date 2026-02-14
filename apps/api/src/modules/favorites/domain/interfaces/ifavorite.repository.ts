import type { IRepository } from "../../../../shared/repositories/irepository.interface";
import type { FavoriteEntity } from "../entities/favorite.entity";

export type IFavoriteRepository = IRepository<FavoriteEntity>;

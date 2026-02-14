import { Inject, Injectable } from "@nestjs/common";
import { FAVORITE_REPOSITORY } from "../../domain/interfaces/favorite-repository.token";
import type { IFavoriteRepository } from "../../domain/interfaces/ifavorite.repository";
import type { FavoriteEntity } from "../../domain/entities/favorite.entity";
import { PrismaService } from "../../../../prisma/prisma.service";

@Injectable()
export class FavoritesDataService {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favoriteRepo: IFavoriteRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getByUserId(userId: string): Promise<FavoriteEntity[]> {
    return this.favoriteRepo.findMany({ where: { userId } });
  }

  async addFavorite(userId: string, zikrId: number): Promise<FavoriteEntity> {
    try {
      return await this.favoriteRepo.create({
        data: { userId, zikrId },
      });
    } catch (error: unknown) {
      // P2002: Unique constraint violation — already favorited, treat as idempotent
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        const existing = await this.prisma.favorite.findFirst({
          where: { userId, zikrId },
        });
        return existing as unknown as FavoriteEntity;
      }
      throw error;
    }
  }

  async removeFavorite(userId: string, zikrId: number): Promise<void> {
    try {
      await this.prisma.favorite.delete({
        where: {
          userId_zikrId: { userId, zikrId },
        },
      });
    } catch (error: unknown) {
      // P2025: Record not found — already removed, treat as idempotent
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2025"
      ) {
        return;
      }
      throw error;
    }
  }
}

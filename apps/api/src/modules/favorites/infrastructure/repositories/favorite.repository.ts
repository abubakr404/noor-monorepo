import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "../../../../shared/repositories/prisma.repository";
import { PrismaService } from "../../../../prisma/prisma.service";
import type { FavoriteEntity } from "../../domain/entities/favorite.entity";

@Injectable()
export class FavoriteRepository extends PrismaRepository<FavoriteEntity> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    // Prisma delegate type is complex; cast needed for abstract method
    return this.prisma.favorite as never;
  }
}

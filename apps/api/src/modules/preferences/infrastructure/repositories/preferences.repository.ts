import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "../../../../shared/repositories/prisma.repository";
import { PrismaService } from "../../../../prisma/prisma.service";
import type { PreferencesEntity } from "../../domain/entities/preferences.entity";

@Injectable()
export class PreferencesRepository extends PrismaRepository<PreferencesEntity> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    // Prisma delegate type is complex; cast needed for abstract method
    return this.prisma.userPreferences as never;
  }
}

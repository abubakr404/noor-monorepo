import { Inject, Injectable } from "@nestjs/common";
import { ZIKR_REPOSITORY } from "../../domain/interfaces/zikr-repository.token";
import type { IZikrRepository } from "../../domain/interfaces/izikr.repository";
import { PrismaService } from "../../../../prisma/prisma.service";
import type { ZikrEntity } from "../../domain/entities/zikr.entity";
import type { CounterPresetEntity } from "../../domain/entities/counter-preset.entity";
import type { SeedZikr, SeedCounterPreset } from "@repo/data";

@Injectable()
export class AzkarDataService {
  constructor(
    @Inject(ZIKR_REPOSITORY) private readonly zikrRepo: IZikrRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getByCategory(category: string): Promise<ZikrEntity[]> {
    return this.zikrRepo.findMany({
      where: { category },
      orderBy: { orderIndex: "asc" },
    });
  }

  async getAll(): Promise<ZikrEntity[]> {
    return this.zikrRepo.findMany({
      orderBy: [{ category: "asc" }, { orderIndex: "asc" }],
    });
  }

  async getById(id: number): Promise<ZikrEntity | null> {
    return this.zikrRepo.findUnique({ where: { id } });
  }

  async getCounterPresets(): Promise<CounterPresetEntity[]> {
    return this.prisma.counterPreset.findMany({
      orderBy: { orderIndex: "asc" },
    }) as unknown as Promise<CounterPresetEntity[]>;
  }

  async getContentVersion(key: string): Promise<{ version: number } | null> {
    return this.prisma.contentVersion.findUnique({
      where: { key },
      select: { version: true },
    });
  }

  async seedAzkar(
    azkar: SeedZikr[],
    presets: SeedCounterPreset[],
  ): Promise<{ seeded: number; presets: number }> {
    await this.prisma.zikr.createMany({ data: azkar as never });
    await this.prisma.counterPreset.createMany({ data: presets as never });
    await this.prisma.contentVersion.upsert({
      where: { key: "azkar" },
      create: { key: "azkar", version: 1 },
      update: { version: { increment: 1 } },
    });
    await this.prisma.contentVersion.upsert({
      where: { key: "counter-presets" },
      create: { key: "counter-presets", version: 1 },
      update: { version: { increment: 1 } },
    });
    return { seeded: azkar.length, presets: presets.length };
  }
}

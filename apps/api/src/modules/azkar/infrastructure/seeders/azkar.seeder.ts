import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { AzkarDataService } from "../../application/services/azkar-data.service";
import {
  morningAzkar,
  eveningAzkar,
  nightAzkar,
  counterPresets,
} from "@repo/data";

@Injectable()
export class AzkarSeeder implements OnModuleInit {
  private readonly logger = new Logger(AzkarSeeder.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly azkarData: AzkarDataService,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.prisma.zikr.count();
    if (count === 0) {
      this.logger.log("Zikr table empty — seeding azkar data...");
      const allAzkar = [...morningAzkar, ...eveningAzkar, ...nightAzkar];
      const result = await this.azkarData.seedAzkar(allAzkar, counterPresets);
      this.logger.log(
        `Seeded ${result.seeded} azkar + ${result.presets} presets`,
      );
    } else {
      this.logger.log(`Azkar already seeded (${count} records)`);
    }
  }
}

import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import {
  AzkarController,
  CounterPresetsController,
} from "./presentation/azkar.controller";
import { AzkarDataService } from "./application/services/azkar-data.service";
import { ZikrRepository } from "./infrastructure/repositories/zikr.repository";
import { ZIKR_REPOSITORY } from "./domain/interfaces/zikr-repository.token";
import { AzkarSeeder } from "./infrastructure/seeders/azkar.seeder";
import { SeedAzkarHandler } from "./application/commands/seed-azkar.handler";
import { GetAzkarByCategoryHandler } from "./application/queries/get-azkar-by-category.handler";
import { GetAzkarVersionHandler } from "./application/queries/get-azkar-version.handler";
import { GetCounterPresetsHandler } from "./application/queries/get-counter-presets.handler";

const CommandHandlers = [SeedAzkarHandler];
const QueryHandlers = [
  GetAzkarByCategoryHandler,
  GetAzkarVersionHandler,
  GetCounterPresetsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [AzkarController, CounterPresetsController],
  providers: [
    ZikrRepository,
    { provide: ZIKR_REPOSITORY, useExisting: ZikrRepository },
    AzkarDataService,
    AzkarSeeder,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AzkarDataService],
})
export class AzkarModule {}

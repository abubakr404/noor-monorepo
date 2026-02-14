import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCounterPresetsQuery } from "./get-counter-presets.query";
import { AzkarDataService } from "../services/azkar-data.service";
import type { CounterPresetEntity } from "../../domain/entities/counter-preset.entity";

@QueryHandler(GetCounterPresetsQuery)
export class GetCounterPresetsHandler implements IQueryHandler<GetCounterPresetsQuery> {
  constructor(private readonly azkarData: AzkarDataService) {}

  async execute(): Promise<CounterPresetEntity[]> {
    return this.azkarData.getCounterPresets();
  }
}

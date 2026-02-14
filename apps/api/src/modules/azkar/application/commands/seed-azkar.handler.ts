import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SeedAzkarCommand } from "./seed-azkar.command";
import { AzkarDataService } from "../services/azkar-data.service";
import {
  morningAzkar,
  eveningAzkar,
  nightAzkar,
  counterPresets,
} from "@repo/data";

@CommandHandler(SeedAzkarCommand)
export class SeedAzkarHandler implements ICommandHandler<SeedAzkarCommand> {
  constructor(private readonly azkarData: AzkarDataService) {}

  async execute(): Promise<{ seeded: number; presets: number }> {
    const allAzkar = [...morningAzkar, ...eveningAzkar, ...nightAzkar];
    return this.azkarData.seedAzkar(allAzkar, counterPresets);
  }
}

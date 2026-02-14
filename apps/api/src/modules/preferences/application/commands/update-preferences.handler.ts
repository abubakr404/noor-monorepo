import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatePreferencesCommand } from "./update-preferences.command";
import { PreferencesDataService } from "../services/preferences-data.service";
import type { PreferencesEntity } from "../../domain/entities/preferences.entity";

@CommandHandler(UpdatePreferencesCommand)
export class UpdatePreferencesHandler
  implements ICommandHandler<UpdatePreferencesCommand>
{
  constructor(private readonly preferencesData: PreferencesDataService) {}

  async execute(command: UpdatePreferencesCommand): Promise<PreferencesEntity> {
    return this.preferencesData.updatePreferences(
      command.userId,
      command.data,
    );
  }
}

import type { PreferencesEntity } from "../../domain/entities/preferences.entity";

export class UpdatePreferencesCommand {
  constructor(
    public readonly userId: string,
    public readonly data: Partial<Omit<PreferencesEntity, "id" | "userId">>,
  ) {}
}

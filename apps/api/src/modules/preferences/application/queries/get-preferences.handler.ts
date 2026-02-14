import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetPreferencesQuery } from "./get-preferences.query";
import { PreferencesDataService } from "../services/preferences-data.service";
import type { PreferencesEntity } from "../../domain/entities/preferences.entity";

@QueryHandler(GetPreferencesQuery)
export class GetPreferencesHandler
  implements IQueryHandler<GetPreferencesQuery>
{
  constructor(private readonly preferencesData: PreferencesDataService) {}

  async execute(query: GetPreferencesQuery): Promise<PreferencesEntity> {
    const prefs = await this.preferencesData.getByUserId(query.userId);

    if (!prefs) {
      // Create defaults for first-time access
      return this.preferencesData.updatePreferences(query.userId, {});
    }

    return prefs;
  }
}

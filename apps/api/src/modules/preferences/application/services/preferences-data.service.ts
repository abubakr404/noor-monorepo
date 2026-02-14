import { Inject, Injectable } from "@nestjs/common";
import { PREFERENCES_REPOSITORY } from "../../domain/interfaces/preferences-repository.token";
import type { IPreferencesRepository } from "../../domain/interfaces/ipreferences.repository";
import type { PreferencesEntity } from "../../domain/entities/preferences.entity";

const DEFAULTS: Omit<PreferencesEntity, "id" | "userId"> = {
  language: "ar",
  theme: "light",
  counterMode: "simple",
  soundEnabled: true,
  vibrationEnabled: true,
};

@Injectable()
export class PreferencesDataService {
  constructor(
    @Inject(PREFERENCES_REPOSITORY)
    private readonly preferencesRepo: IPreferencesRepository,
  ) {}

  async getByUserId(userId: string): Promise<PreferencesEntity | null> {
    return this.preferencesRepo.findUnique({ where: { userId } });
  }

  async updatePreferences(
    userId: string,
    data: Partial<Omit<PreferencesEntity, "id" | "userId">>,
  ): Promise<PreferencesEntity> {
    return this.preferencesRepo.upsert({
      where: { userId },
      create: {
        userId,
        ...DEFAULTS,
        ...data,
      },
      update: data,
    });
  }
}

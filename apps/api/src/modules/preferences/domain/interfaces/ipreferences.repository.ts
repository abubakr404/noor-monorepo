import type { IRepository } from "../../../../shared/repositories/irepository.interface";
import type { PreferencesEntity } from "../entities/preferences.entity";

export type IPreferencesRepository = IRepository<PreferencesEntity>;

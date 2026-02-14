import type { IRepository } from "../../../../shared/repositories/irepository.interface";
import type { DailyProgressEntity } from "../entities/daily-progress.entity";

export type IProgressRepository = IRepository<DailyProgressEntity>;

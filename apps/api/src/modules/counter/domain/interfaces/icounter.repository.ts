import type { IRepository } from "../../../../shared/repositories/irepository.interface";
import type { CounterStateEntity } from "../entities/counter-state.entity";

export type ICounterRepository = IRepository<CounterStateEntity>;

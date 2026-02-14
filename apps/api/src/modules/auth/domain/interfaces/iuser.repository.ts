import type { IRepository } from "../../../../shared/repositories/irepository.interface";
import type { UserEntity } from "../entities/user.entity";

export type IUserRepository = IRepository<UserEntity>;

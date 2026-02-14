import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { GetCurrentUserQuery } from "./get-current-user.query";
import { AuthDataService } from "../services/auth-data.service";
import type { UserEntity } from "../../domain/entities/user.entity";

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler
  implements IQueryHandler<GetCurrentUserQuery>
{
  constructor(private readonly authData: AuthDataService) {}

  async execute(
    query: GetCurrentUserQuery,
  ): Promise<Omit<UserEntity, "passwordHash">> {
    const user = await this.authData.findUserProfile(query.userId);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }
}

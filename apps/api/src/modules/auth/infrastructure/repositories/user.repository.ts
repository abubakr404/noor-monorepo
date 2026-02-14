import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "../../../../shared/repositories/prisma.repository";
import { PrismaService } from "../../../../prisma/prisma.service";
import type { UserEntity } from "../../domain/entities/user.entity";

@Injectable()
export class UserRepository extends PrismaRepository<UserEntity> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    // Prisma delegate type is complex and auto-generated; cast needed to satisfy abstract method signature
    return this.prisma.user as never;
  }
}

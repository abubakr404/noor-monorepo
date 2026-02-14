import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "../../../../shared/repositories/prisma.repository";
import { PrismaService } from "../../../../prisma/prisma.service";
import type { ZikrEntity } from "../../domain/entities/zikr.entity";

@Injectable()
export class ZikrRepository extends PrismaRepository<ZikrEntity> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    // Prisma delegate type is complex; cast needed for abstract method
    return this.prisma.zikr as never;
  }
}

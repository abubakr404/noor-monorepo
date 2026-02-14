import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "../../../../shared/repositories/prisma.repository";
import { PrismaService } from "../../../../prisma/prisma.service";
import type { CounterStateEntity } from "../../domain/entities/counter-state.entity";

@Injectable()
export class CounterRepository extends PrismaRepository<CounterStateEntity> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    // Prisma delegate type is complex; cast needed for abstract method
    return this.prisma.counterState as never;
  }
}

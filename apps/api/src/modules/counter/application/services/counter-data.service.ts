import { Inject, Injectable } from "@nestjs/common";
import { COUNTER_REPOSITORY } from "../../domain/interfaces/counter-repository.token";
import type { ICounterRepository } from "../../domain/interfaces/icounter.repository";
import type { CounterStateEntity } from "../../domain/entities/counter-state.entity";

@Injectable()
export class CounterDataService {
  constructor(
    @Inject(COUNTER_REPOSITORY)
    private readonly counterRepo: ICounterRepository,
  ) {}

  async getByUserId(userId: string): Promise<CounterStateEntity | null> {
    return this.counterRepo.findUnique({ where: { userId } });
  }

  async saveState(
    userId: string,
    current: number,
    target: number,
    presetId?: string,
    customLabel?: string,
  ): Promise<CounterStateEntity> {
    return this.counterRepo.upsert({
      where: { userId },
      create: {
        userId,
        current,
        target,
        presetId: presetId ?? null,
        customLabel: customLabel ?? null,
      },
      update: {
        current,
        target,
        presetId: presetId ?? null,
        customLabel: customLabel ?? null,
      },
    });
  }
}

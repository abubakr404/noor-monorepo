import { Inject, Injectable } from "@nestjs/common";
import { PROGRESS_REPOSITORY } from "../../domain/interfaces/progress-repository.token";
import type { IProgressRepository } from "../../domain/interfaces/iprogress.repository";
import { PrismaService } from "../../../../prisma/prisma.service";
import type { DailyProgressEntity } from "../../domain/entities/daily-progress.entity";
import type { StreakEntity } from "../../domain/entities/streak.entity";

function getYesterday(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

@Injectable()
export class ProgressDataService {
  constructor(
    @Inject(PROGRESS_REPOSITORY) private readonly progressRepo: IProgressRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getByDateAndUser(userId: string, date: string): Promise<DailyProgressEntity[]> {
    return this.progressRepo.findMany({
      where: { userId, date },
    });
  }

  async upsertProgress(
    userId: string,
    date: string,
    category: string,
    completedIds: number[],
    inProgress: Record<string, number>,
  ): Promise<DailyProgressEntity> {
    return this.progressRepo.upsert({
      where: {
        userId_date_category: { userId, date, category },
      },
      create: {
        userId,
        date,
        category,
        completedIds: JSON.stringify(completedIds),
        inProgress: JSON.stringify(inProgress),
      },
      update: {
        completedIds: JSON.stringify(completedIds),
        inProgress: JSON.stringify(inProgress),
      },
    });
  }

  async getStreak(userId: string): Promise<StreakEntity | null> {
    return this.prisma.streak.findUnique({
      where: { userId },
    }) as unknown as Promise<StreakEntity | null>;
  }

  async updateStreak(userId: string, date: string): Promise<StreakEntity> {
    const existing = await this.getStreak(userId);

    if (!existing) {
      return this.prisma.streak.create({
        data: { userId, count: 1, lastDate: date },
      }) as unknown as Promise<StreakEntity>;
    }

    if (existing.lastDate === date) {
      return existing;
    }

    const yesterday = getYesterday(date);

    if (existing.lastDate === yesterday) {
      return this.prisma.streak.update({
        where: { userId },
        data: { count: existing.count + 1, lastDate: date },
      }) as unknown as Promise<StreakEntity>;
    }

    return this.prisma.streak.update({
      where: { userId },
      data: { count: 1, lastDate: date },
    }) as unknown as Promise<StreakEntity>;
  }
}

import { PrismaService } from "../../prisma/prisma.service";
import { IRepository } from "./irepository.interface";

/**
 * Abstract Prisma repository base class.
 * Subclasses provide `getDelegate()` returning the Prisma model delegate.
 */
export abstract class PrismaRepository<T = unknown> implements IRepository<T> {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Returns the Prisma model delegate (e.g., this.prisma.user).
   * Must be implemented by each concrete repository.
   */
  protected abstract getDelegate(): {
    findUnique(args: unknown): Promise<T | null>;
    findFirst(args: unknown): Promise<T | null>;
    findMany(args: unknown): Promise<T[]>;
    create(args: unknown): Promise<T>;
    update(args: unknown): Promise<T>;
    delete(args: unknown): Promise<T>;
    upsert(args: unknown): Promise<T>;
    count(args?: unknown): Promise<number>;
    updateMany(args: unknown): Promise<{ count: number }>;
    deleteMany(args: unknown): Promise<{ count: number }>;
  };

  async findUnique(args: unknown): Promise<T | null> {
    return this.getDelegate().findUnique(args);
  }

  async findFirst(args: unknown): Promise<T | null> {
    return this.getDelegate().findFirst(args);
  }

  async findMany(args: unknown): Promise<T[]> {
    return this.getDelegate().findMany(args);
  }

  async create(args: unknown): Promise<T> {
    return this.getDelegate().create(args);
  }

  async update(args: unknown): Promise<T> {
    return this.getDelegate().update(args);
  }

  async delete(args: unknown): Promise<T> {
    return this.getDelegate().delete(args);
  }

  async upsert(args: unknown): Promise<T> {
    return this.getDelegate().upsert(args);
  }

  async count(args?: unknown): Promise<number> {
    return this.getDelegate().count(args);
  }

  async updateMany(args: unknown): Promise<{ count: number }> {
    return this.getDelegate().updateMany(args);
  }

  async deleteMany(args: unknown): Promise<{ count: number }> {
    return this.getDelegate().deleteMany(args);
  }

  // ─── Convenience helpers ─────────────────────────────

  async findOne(id: string | number): Promise<T | null> {
    return this.findUnique({ where: { id } });
  }

  async findAll(): Promise<T[]> {
    return this.findMany({});
  }

  async findAllByIds(ids: (string | number)[]): Promise<T[]> {
    return this.findMany({ where: { id: { in: ids } } });
  }

  async exists(id: string | number): Promise<boolean> {
    const count = await this.count({ where: { id } });
    return count > 0;
  }
}

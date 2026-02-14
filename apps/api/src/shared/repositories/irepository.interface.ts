/**
 * Base repository interface that all domain repository interfaces extend.
 * Mirrors the Prisma delegate API shape for consistency.
 */
export interface IRepository<T = unknown> {
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
}

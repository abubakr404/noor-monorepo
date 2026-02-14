export class UpsertProgressCommand {
  constructor(
    public readonly userId: string,
    public readonly date: string,
    public readonly category: string,
    public readonly completedIds: number[],
    public readonly inProgress: Record<string, number>,
  ) {}
}

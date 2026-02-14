export class SaveCounterCommand {
  constructor(
    public readonly userId: string,
    public readonly current: number,
    public readonly target: number,
    public readonly presetId?: string,
    public readonly customLabel?: string,
  ) {}
}

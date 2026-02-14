export class GetDailyProgressQuery {
  constructor(
    public readonly userId: string,
    public readonly date: string,
  ) {}
}

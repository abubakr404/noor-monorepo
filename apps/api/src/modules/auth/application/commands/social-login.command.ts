export class SocialLoginCommand {
  constructor(
    public readonly provider: string,
    public readonly token: string,
  ) {}
}

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UnauthorizedException } from "@nestjs/common";
import { RefreshTokenCommand } from "./refresh-token.command";
import { AuthDataService } from "../services/auth-data.service";

interface AuthResult {
  accessToken: string;
  refreshToken: string;
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(private readonly authData: AuthDataService) {}

  async execute(command: RefreshTokenCommand): Promise<AuthResult> {
    const record = await this.authData.findRefreshToken(command.token);
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    await this.authData.deleteRefreshToken(command.token);
    const user = await this.authData.findUserById(record.userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return this.authData.issueTokens(user);
  }
}

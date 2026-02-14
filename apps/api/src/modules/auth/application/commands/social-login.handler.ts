import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UnauthorizedException } from "@nestjs/common";
import { SocialLoginCommand } from "./social-login.command";
import { AuthDataService } from "../services/auth-data.service";
import { GoogleAuthService } from "../../infrastructure/strategies/google.strategy";
import { AppleAuthService } from "../../infrastructure/strategies/apple.strategy";
import { PrismaService } from "../../../../prisma/prisma.service";

interface AuthResult {
  accessToken: string;
  refreshToken: string;
}

@CommandHandler(SocialLoginCommand)
export class SocialLoginHandler
  implements ICommandHandler<SocialLoginCommand>
{
  constructor(
    private readonly authData: AuthDataService,
    private readonly googleAuth: GoogleAuthService,
    private readonly appleAuth: AppleAuthService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: SocialLoginCommand): Promise<AuthResult> {
    let email: string | null = null;
    let name: string | null = null;
    let avatarUrl: string | null = null;
    let providerId: string;

    if (command.provider === "google") {
      const payload = await this.googleAuth.verifyToken(command.token);
      if (!payload || !payload.sub) {
        throw new UnauthorizedException("Invalid Google token");
      }
      providerId = payload.sub;
      email = payload.email ?? null;
      name = payload.name ?? null;
      avatarUrl = payload.picture ?? null;
    } else if (command.provider === "apple") {
      const payload = await this.appleAuth.verifyToken(command.token);
      if (!payload || !payload.sub) {
        throw new UnauthorizedException("Invalid Apple token");
      }
      providerId = payload.sub;
      email = payload.email ?? null;
    } else {
      throw new UnauthorizedException("Unsupported provider");
    }

    const user = await this.authData.findOrCreateSocialUser(
      command.provider,
      providerId,
      email,
      name,
      avatarUrl,
    );

    // Create default preferences if new user (check if preferences exist)
    const existingPrefs = await this.prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });
    if (!existingPrefs) {
      await this.prisma.userPreferences.create({
        data: { userId: user.id },
      });
    }

    return this.authData.issueTokens(user);
  }
}

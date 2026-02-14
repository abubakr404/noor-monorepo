import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { LoginCommand } from "./login.command";
import { AuthDataService } from "../services/auth-data.service";

interface AuthResult {
  accessToken: string;
  refreshToken: string;
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(private readonly authData: AuthDataService) {}

  async execute(command: LoginCommand): Promise<AuthResult> {
    const user = await this.authData.findUserByEmail(command.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(command.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.authData.issueTokens(user);
  }
}

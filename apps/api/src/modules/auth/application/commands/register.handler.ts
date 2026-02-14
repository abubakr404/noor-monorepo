import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConflictException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { RegisterCommand } from "./register.command";
import { AuthDataService } from "../services/auth-data.service";
import { PrismaService } from "../../../../prisma/prisma.service";

interface AuthResult {
  accessToken: string;
  refreshToken: string;
}

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly authData: AuthDataService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: RegisterCommand): Promise<AuthResult> {
    const existing = await this.authData.findUserByEmail(command.email);
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(command.password, 12);
    const user = await this.authData.createUser({
      email: command.email,
      passwordHash,
      name: command.name,
    });

    await this.prisma.userPreferences.create({
      data: { userId: user.id },
    });

    return this.authData.issueTokens(user);
  }
}

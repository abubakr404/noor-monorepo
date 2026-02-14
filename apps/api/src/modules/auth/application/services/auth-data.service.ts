import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import { USER_REPOSITORY } from "../../domain/interfaces/user-repository.token";
import type { IUserRepository } from "../../domain/interfaces/iuser.repository";
import { PrismaService } from "../../../../prisma/prisma.service";
import type { UserEntity } from "../../domain/entities/user.entity";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface CreateUserData {
  email: string;
  passwordHash: string;
  name?: string;
}

@Injectable()
export class AuthDataService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findFirst({ where: { email } });
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    return this.userRepo.findUnique({ where: { id } });
  }

  /**
   * Returns user profile without sensitive fields (passwordHash).
   * Used for the /me endpoint and public-facing responses.
   */
  async findUserProfile(id: string): Promise<Omit<UserEntity, "passwordHash"> | null> {
    const user = await this.userRepo.findUnique({ where: { id } });
    if (!user) return null;
    const { passwordHash: _, ...profile } = user;
    return profile;
  }

  async createUser(data: CreateUserData): Promise<UserEntity> {
    return this.userRepo.create({ data });
  }

  async findOrCreateSocialUser(
    provider: string,
    providerId: string,
    email: string | null,
    name: string | null,
    avatarUrl: string | null,
  ): Promise<UserEntity> {
    const existing = await this.userRepo.findFirst({
      where: { provider, providerId },
    });
    if (existing) return existing;

    if (email) {
      const emailUser = await this.findUserByEmail(email);
      if (emailUser) return emailUser;
    }

    return this.userRepo.create({
      data: { email, name, provider, providerId, avatarUrl },
    });
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
    return token;
  }

  async findRefreshToken(
    token: string,
  ): Promise<{ userId: string; token: string; expiresAt: Date } | null> {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { token } });
  }

  async issueTokens(user: {
    id: string;
    email?: string | null;
  }): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
    const refreshToken = await this.createRefreshToken(user.id);
    return { accessToken, refreshToken };
  }
}

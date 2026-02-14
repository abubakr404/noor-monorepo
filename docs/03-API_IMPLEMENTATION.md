# Zikr App - NestJS API Implementation Plan

> **Stack**: NestJS 10 · Clean Architecture (4-layer) · CQRS (`@nestjs/cqrs`) · Prisma 7 (`@prisma/adapter-pg` + `pg.Pool`) · PostgreSQL · Passport.js (JWT + Google + Apple) · bcryptjs
>
> **Port**: 3001 · **Prefix**: `api/v1` · **CORS**: Enabled

---

## Summary

| Metric           | Value                                                      |
| ---------------- | ---------------------------------------------------------- |
| **Total files**  | ~75+                                                       |
| **Modules**      | 6 (auth, azkar, progress, counter, favorites, preferences) |
| **Endpoints**    | 18                                                         |
| **Phases**       | 10 + Verification                                          |
| **Dependencies** | See [Phase 1, Step 1](#step-1-install-all-dependencies)    |

### Endpoints Overview

| Module      | Method | Path                      | Auth   |
| ----------- | ------ | ------------------------- | ------ |
| Auth        | POST   | `/auth/register`          | Public |
| Auth        | POST   | `/auth/login`             | Public |
| Auth        | POST   | `/auth/refresh`           | Public |
| Auth        | POST   | `/auth/google`            | Public |
| Auth        | POST   | `/auth/apple`             | Public |
| Auth        | GET    | `/auth/me`                | JWT    |
| Azkar       | GET    | `/azkar?category=morning` | Public |
| Azkar       | GET    | `/azkar/version`          | Public |
| Azkar       | GET    | `/azkar/all`              | Public |
| Azkar       | GET    | `/counter-presets`        | Public |
| Progress    | GET    | `/progress?date=...`      | JWT    |
| Progress    | PUT    | `/progress`               | JWT    |
| Progress    | GET    | `/progress/streak`        | JWT    |
| Counter     | GET    | `/counter`                | JWT    |
| Counter     | PUT    | `/counter`                | JWT    |
| Favorites   | GET    | `/favorites`              | JWT    |
| Favorites   | POST   | `/favorites/:zikrId`      | JWT    |
| Favorites   | DELETE | `/favorites/:zikrId`      | JWT    |
| Preferences | GET    | `/preferences`            | JWT    |
| Preferences | PATCH  | `/preferences`            | JWT    |

### Dependencies to Install

**Production:**
`@nestjs/cqrs` `@nestjs/config` `@nestjs/passport` `@nestjs/jwt` `passport` `passport-jwt` `@prisma/adapter-pg` `pg` `bcryptjs` `class-validator` `class-transformer` `google-auth-library` `apple-signin-auth` `uuid`

**Dev:**
`prisma` `@types/pg` `@types/bcryptjs` `@types/passport-jwt` `@types/uuid`

---

## Prerequisites

- [ ] PostgreSQL running and accessible
- [ ] `DATABASE_URL` set in `apps/api/.env` (e.g. `postgresql://user:pass@localhost:5432/zikr`)
- [ ] `JWT_SECRET` set in `apps/api/.env`
- [ ] `GOOGLE_CLIENT_ID` set in `apps/api/.env` (for Google OAuth)
- [ ] Node.js >= 18
- [ ] pnpm installed
- [ ] `@repo/data` package exists with seed JSON (see `02-IMPLEMENTATION_PLAN.md` Phase 1.2)

---

## Phase 1: Infrastructure Setup

### Step 1: Install all dependencies

- [ ] Install production + dev dependencies in `apps/api/`

```bash
# Production dependencies
pnpm add @nestjs/cqrs @nestjs/config @nestjs/passport @nestjs/jwt \
  passport passport-jwt \
  @prisma/adapter-pg pg \
  bcryptjs class-validator class-transformer \
  google-auth-library apple-signin-auth uuid

# Dev dependencies
pnpm add -D prisma @types/pg @types/bcryptjs @types/passport-jwt @types/uuid
```

### Step 2: Create Prisma schema with ALL models

- [ ] Create `apps/api/prisma/schema.prisma`

Full schema with all 10 models:

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Auth ────────────────────────────────────────────────

model User {
  id            String           @id @default(cuid())
  email         String?          @unique
  passwordHash  String?
  name          String?
  provider      String           @default("local")   // "local" | "google" | "apple"
  providerId    String?
  avatarUrl     String?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  preferences   UserPreferences?
  progress      DailyProgress[]
  counterState  CounterState?
  favorites     Favorite[]
  streak        Streak?
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model UserPreferences {
  id               String  @id @default(cuid())
  userId           String  @unique
  user             User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  language         String  @default("ar")
  theme            String  @default("system")       // "light" | "dark" | "system"
  counterMode      String  @default("interactive")  // "interactive" | "display"
  soundEnabled     Boolean @default(true)
  vibrationEnabled Boolean @default(true)
}

// ─── Azkar Content ───────────────────────────────────────

model Zikr {
  id              Int      @id @default(autoincrement())
  arabicText      String   // Full tashkeel
  arabicTextClean String?  // Without tashkeel (for search)
  translationEn   String?
  translationAr   String?
  transliteration String?
  repeatCount     Int      @default(1)
  reference       String?
  virtueAr        String?
  virtueEn        String?
  category        String   // "morning" | "evening" | "night"
  orderIndex      Int
  version         Int      @default(1)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([category, orderIndex])
}

model CounterPreset {
  id          String @id @default(cuid())
  labelAr     String
  labelEn     String
  targetCount Int
  orderIndex  Int
  version     Int    @default(1)
}

model ContentVersion {
  id        String   @id @default(cuid())
  key       String   @unique  // e.g. "azkar", "counter-presets"
  version   Int      @default(1)
  updatedAt DateTime @updatedAt
}

// ─── User Progress ───────────────────────────────────────

model DailyProgress {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date         String   // ISO date string "2026-02-11"
  category     String   // "morning" | "evening" | "night"
  completedIds String   // JSON string: "[1,2,3]"
  inProgress   String   // JSON string: "{\"4\":2}"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([userId, date, category])
}

// ─── Counter State ───────────────────────────────────────

model CounterState {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  current     Int     @default(0)
  target      Int     @default(33)
  presetId    String?
  customLabel String?
}

// ─── Favorites ───────────────────────────────────────────

model Favorite {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  zikrId Int

  @@unique([userId, zikrId])
}

// ─── Streak ──────────────────────────────────────────────

model Streak {
  id       String @id @default(cuid())
  userId   String @unique
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  count    Int    @default(0)
  lastDate String // ISO date string
}
```

### Step 3: Generate Prisma client and run initial migration

- [ ] Run Prisma generate + migrate

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
```

This generates the client into `src/generated/prisma/` and creates the initial migration. Add `src/generated/` to `.gitignore`.

### Step 4: Create PrismaService

- [ ] Create `apps/api/src/prisma/prisma.service.ts`

Uses `@prisma/adapter-pg` with `pg.Pool` for connection pooling (Prisma 7 pattern):

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: pg.Pool;

  constructor() {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
```

### Step 5: Create PrismaModule (Global)

- [ ] Create `apps/api/src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## Phase 2: Shared Repository Base

### Step 6: Create IRepository interface

- [ ] Create `apps/api/src/shared/repositories/irepository.interface.ts`

Base interface that all domain repository interfaces extend. Mirrors the Prisma delegate API shape:

```typescript
export interface IRepository {
  findUnique<T = unknown>(args: unknown): Promise<T | null>;
  findFirst<T = unknown>(args: unknown): Promise<T | null>;
  findMany<T = unknown>(args: unknown): Promise<T[]>;
  create<T = unknown>(args: unknown): Promise<T>;
  update<T = unknown>(args: unknown): Promise<T>;
  delete<T = unknown>(args: unknown): Promise<T>;
  upsert<T = unknown>(args: unknown): Promise<T>;
  count(args?: unknown): Promise<number>;
  updateMany(args: unknown): Promise<unknown>;
  deleteMany(args: unknown): Promise<unknown>;
}
```

### Step 7: Create abstract PrismaRepository\<T\>

- [ ] Create `apps/api/src/shared/repositories/prisma.repository.ts`

Abstract base class. Each module's repository extends this and provides `getDelegate()`:

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IRepository } from "./irepository.interface";

@Injectable()
export abstract class PrismaRepository<T = unknown> implements IRepository {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract getDelegate(): any; // Returns the Prisma model delegate

  async findUnique<R = T>(args: unknown): Promise<R | null> {
    return this.getDelegate().findUnique(args);
  }

  async findFirst<R = T>(args: unknown): Promise<R | null> {
    return this.getDelegate().findFirst(args);
  }

  async findMany<R = T>(args: unknown): Promise<R[]> {
    return this.getDelegate().findMany(args);
  }

  async create<R = T>(args: unknown): Promise<R> {
    return this.getDelegate().create(args);
  }

  async update<R = T>(args: unknown): Promise<R> {
    return this.getDelegate().update(args);
  }

  async delete<R = T>(args: unknown): Promise<R> {
    return this.getDelegate().delete(args);
  }

  async upsert<R = T>(args: unknown): Promise<R> {
    return this.getDelegate().upsert(args);
  }

  async count(args?: unknown): Promise<number> {
    return this.getDelegate().count(args);
  }

  async updateMany(args: unknown): Promise<unknown> {
    return this.getDelegate().updateMany(args);
  }

  async deleteMany(args: unknown): Promise<unknown> {
    return this.getDelegate().deleteMany(args);
  }

  // ─── Convenience helpers ─────────────────────────────

  async findOne(id: string | number): Promise<T | null> {
    return this.findUnique({ where: { id } });
  }

  async findAll(): Promise<T[]> {
    return this.findMany({});
  }

  async findAllByIds(ids: (string | number)[]): Promise<T[]> {
    return this.findMany({ where: { id: { in: ids } } });
  }

  async exists(id: string | number): Promise<boolean> {
    const count = await this.count({ where: { id } });
    return count > 0;
  }
}
```

---

## Phase 3: Common Infrastructure

### Step 8: CurrentUser decorator

- [ ] Create `apps/api/src/common/decorators/current-user.decorator.ts`

Extracts `userId` from the JWT-authenticated request:

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user?.userId;
  },
);
```

### Step 9: JwtAuthGuard

- [ ] Create `apps/api/src/common/guards/jwt-auth.guard.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

### Step 10: OptionalAuthGuard

- [ ] Create `apps/api/src/common/guards/optional-auth.guard.ts`

Allows unauthenticated access — attaches user if token present, does not throw if absent:

```typescript
import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any) {
    // Don't throw if no user — just return null
    return user || null;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
```

### Step 11: Response interceptor

- [ ] Create `apps/api/src/common/interceptors/response.interceptor.ts`

Wraps all successful responses in `{ success: true, data: ... }`:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
    );
  }
}
```

### Step 12: HttpException filter

- [ ] Create `apps/api/src/common/filters/http-exception.filter.ts`

Standard error format `{ success: false, error: { statusCode, message, error } }`:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    response.status(status).json({
      success: false,
      error: {
        statusCode: status,
        message:
          typeof message === "string" ? message : (message as any).message,
        error: typeof message === "string" ? message : (message as any).error,
      },
    });
  }
}
```

---

## Phase 4: Auth Module (Clean Architecture)

**Directory**: `apps/api/src/modules/auth/`

### Step 13: Domain — UserEntity

- [ ] Create `apps/api/src/modules/auth/domain/entities/user.entity.ts`

```typescript
export interface UserEntity {
  id: string;
  email: string | null;
  passwordHash: string | null;
  name: string | null;
  provider: string;
  providerId: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Step 14: Domain — USER_REPOSITORY token

- [ ] Create `apps/api/src/modules/auth/domain/interfaces/user-repository.token.ts`

```typescript
export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
```

### Step 15: Domain — IUserRepository

- [ ] Create `apps/api/src/modules/auth/domain/interfaces/iuser.repository.ts`

```typescript
import { PrismaRepository } from "../../../../shared/repositories/prisma.repository";
import { UserEntity } from "../entities/user.entity";

export interface IUserRepository extends PrismaRepository<UserEntity> {}
```

### Step 16: Infrastructure — UserRepository

- [ ] Create `apps/api/src/modules/auth/infrastructure/repositories/user.repository.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "../../../../shared/repositories/prisma.repository";
import { PrismaService } from "../../../../prisma/prisma.service";
import { IUserRepository } from "../../domain/interfaces/iuser.repository";

@Injectable()
export class UserRepository
  extends PrismaRepository
  implements IUserRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected getDelegate() {
    return this.prisma.user;
  }
}
```

### Step 17: Application — RegisterDto

- [ ] Create `apps/api/src/modules/auth/application/dto/register.dto.ts`

```typescript
import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}
```

### Step 18: Application — LoginDto

- [ ] Create `apps/api/src/modules/auth/application/dto/login.dto.ts`

```typescript
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

### Step 19: Application — SocialLoginDto

- [ ] Create `apps/api/src/modules/auth/application/dto/social-login.dto.ts`

```typescript
import { IsEnum, IsString } from "class-validator";

export enum SocialProvider {
  GOOGLE = "google",
  APPLE = "apple",
}

export class SocialLoginDto {
  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @IsString()
  token: string; // Google ID token or Apple auth code
}
```

### Step 20: Application — AuthDataService

- [ ] Create `apps/api/src/modules/auth/application/services/auth-data.service.ts`

Central data service for auth. Injects `IUserRepository` via token + `PrismaService` for refresh tokens. Methods:

- `findUserByEmail(email)` — look up user by email
- `findUserById(id)` — look up user by id, return profile (no hash)
- `createUser(data)` — create user record
- `findOrCreateSocialUser(provider, providerId, email, name, avatar)` — upsert for OAuth
- `createRefreshToken(userId)` — generate UUID refresh token, store with 7d expiry
- `findRefreshToken(token)` — look up refresh token record
- `deleteRefreshToken(token)` — remove refresh token (for rotation)
- `issueTokens(user)` — create JWT access token (15m) + refresh token, return `{ accessToken, refreshToken }`

```typescript
import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from "uuid";
import { USER_REPOSITORY } from "../../domain/interfaces/user-repository.token";
import { IUserRepository } from "../../domain/interfaces/iuser.repository";
import { PrismaService } from "../../../../prisma/prisma.service";

@Injectable()
export class AuthDataService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string) {
    return this.userRepo.findFirst({ where: { email } });
  }

  async findUserById(id: string) {
    return this.userRepo.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        provider: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    name?: string;
  }) {
    return this.userRepo.create({ data });
  }

  async findOrCreateSocialUser(
    provider: string,
    providerId: string,
    email: string | null,
    name: string | null,
    avatarUrl: string | null,
  ) {
    const existing = await this.userRepo.findFirst({
      where: { provider, providerId },
    });
    if (existing) return existing;

    // Check if email already exists with different provider
    if (email) {
      const emailUser = await this.findUserByEmail(email);
      if (emailUser) return emailUser; // Link to existing account
    }

    return this.userRepo.create({
      data: { email, name, provider, providerId, avatarUrl },
    });
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    });
    return token;
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string) {
    return this.prisma.refreshToken.delete({ where: { token } });
  }

  async issueTokens(user: { id: string; email?: string | null }) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
    const refreshToken = await this.createRefreshToken(user.id);
    return { accessToken, refreshToken };
  }
}
```

### Step 21: Application — Register command + handler

- [ ] Create `apps/api/src/modules/auth/application/commands/register.command.ts`
- [ ] Create `apps/api/src/modules/auth/application/commands/register.handler.ts`

**Command**: `RegisterCommand(email, password, name?)`

**Handler**: Checks for duplicate email → hashes password with bcryptjs (12 rounds) → creates user → creates default UserPreferences → issues token pair.

```typescript
// register.command.ts
export class RegisterCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name?: string,
  ) {}
}

// register.handler.ts
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConflictException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { RegisterCommand } from "./register.command";
import { AuthDataService } from "../services/auth-data.service";
import { PrismaService } from "../../../../prisma/prisma.service";

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly authData: AuthDataService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: RegisterCommand) {
    const existing = await this.authData.findUserByEmail(command.email);
    if (existing) throw new ConflictException("Email already registered");

    const passwordHash = await bcrypt.hash(command.password, 12);
    const user = await this.authData.createUser({
      email: command.email,
      passwordHash,
      name: command.name,
    });

    // Create default preferences
    await this.prisma.userPreferences.create({
      data: { userId: user.id },
    });

    return this.authData.issueTokens(user);
  }
}
```

### Step 22: Application — Login command + handler

- [ ] Create `apps/api/src/modules/auth/application/commands/login.command.ts`
- [ ] Create `apps/api/src/modules/auth/application/commands/login.handler.ts`

**Command**: `LoginCommand(email, password)`

**Handler**: Finds user by email → verifies password → issues tokens. Throws `UnauthorizedException` on failure.

Same pattern as Register. Key logic:

```typescript
const user = await this.authData.findUserByEmail(command.email);
if (!user || !user.passwordHash)
  throw new UnauthorizedException("Invalid credentials");
const valid = await bcrypt.compare(command.password, user.passwordHash);
if (!valid) throw new UnauthorizedException("Invalid credentials");
return this.authData.issueTokens(user);
```

### Step 23: Application — RefreshToken command + handler

- [ ] Create `apps/api/src/modules/auth/application/commands/refresh-token.command.ts`
- [ ] Create `apps/api/src/modules/auth/application/commands/refresh-token.handler.ts`

**Command**: `RefreshTokenCommand(token)`

**Handler**: Finds refresh token → validates not expired → deletes old token (rotation) → issues new token pair.

```typescript
const record = await this.authData.findRefreshToken(command.token);
if (!record || record.expiresAt < new Date()) {
  throw new UnauthorizedException("Invalid or expired refresh token");
}
await this.authData.deleteRefreshToken(command.token);
const user = await this.authData.findUserById(record.userId);
return this.authData.issueTokens(user);
```

### Step 24: Application — SocialLogin command + handler

- [ ] Create `apps/api/src/modules/auth/application/commands/social-login.command.ts`
- [ ] Create `apps/api/src/modules/auth/application/commands/social-login.handler.ts`

**Command**: `SocialLoginCommand(provider, token)`

**Handler**: Verifies token with Google (`google-auth-library`) or Apple (`apple-signin-auth`) → extracts profile → calls `findOrCreateSocialUser` → creates preferences if new → issues tokens.

```typescript
// Google verification
const ticket = await this.googleClient.verifyIdToken({
  idToken: command.token,
  audience: process.env.GOOGLE_CLIENT_ID,
});
const payload = ticket.getPayload();
const user = await this.authData.findOrCreateSocialUser(
  "google",
  payload.sub,
  payload.email,
  payload.name,
  payload.picture,
);
```

### Step 25: Application — GetCurrentUser query + handler

- [ ] Create `apps/api/src/modules/auth/application/queries/get-current-user.query.ts`
- [ ] Create `apps/api/src/modules/auth/application/queries/get-current-user.handler.ts`

**Query**: `GetCurrentUserQuery(userId)`

**Handler**: Returns user profile (id, email, name, provider, avatarUrl, createdAt) via `authData.findUserById`.

```typescript
export class GetCurrentUserQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(private readonly authData: AuthDataService) {}
  async execute(query: GetCurrentUserQuery) {
    const user = await this.authData.findUserById(query.userId);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }
}
```

### Step 26: Infrastructure — JWT Strategy

- [ ] Create `apps/api/src/modules/auth/infrastructure/strategies/jwt.strategy.ts`

Passport JWT strategy. Extracts token from `Authorization: Bearer <token>` header, validates, returns `{ userId }` to attach to `request.user`.

```typescript
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### Step 27: Infrastructure — Google Strategy

- [ ] Create `apps/api/src/modules/auth/infrastructure/strategies/google.strategy.ts`

Not a Passport strategy — a service that wraps `google-auth-library`'s `OAuth2Client.verifyIdToken()`. Used by `SocialLoginHandler`.

```typescript
import { Injectable } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verifyToken(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  }
}
```

### Step 28: Infrastructure — Apple Strategy

- [ ] Create `apps/api/src/modules/auth/infrastructure/strategies/apple.strategy.ts`

Service wrapping `apple-signin-auth` to verify Apple authorization code / identity token. Used by `SocialLoginHandler`.

```typescript
import { Injectable } from "@nestjs/common";
import appleSignin from "apple-signin-auth";

@Injectable()
export class AppleAuthService {
  async verifyToken(identityToken: string) {
    const payload = await appleSignin.verifyIdToken(identityToken, {
      audience: process.env.APPLE_CLIENT_ID,
    });
    return payload; // { sub, email, email_verified }
  }
}
```

### Step 29: Presentation — AuthController

- [ ] Create `apps/api/src/modules/auth/presentation/auth.controller.ts`

Routes → CommandBus / QueryBus. No business logic in controller.

```typescript
import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RegisterDto } from "../application/dto/register.dto";
import { LoginDto } from "../application/dto/login.dto";
import { SocialLoginDto } from "../application/dto/social-login.dto";
import { RegisterCommand } from "../application/commands/register.command";
import { LoginCommand } from "../application/commands/login.command";
import { RefreshTokenCommand } from "../application/commands/refresh-token.command";
import { SocialLoginCommand } from "../application/commands/social-login.command";
import { GetCurrentUserQuery } from "../application/queries/get-current-user.query";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.commandBus.execute(
      new RegisterCommand(dto.email, dto.password, dto.name),
    );
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(dto.email, dto.password));
  }

  @Post("refresh")
  refresh(@Body("refreshToken") token: string) {
    return this.commandBus.execute(new RefreshTokenCommand(token));
  }

  @Post("google")
  google(@Body() dto: SocialLoginDto) {
    return this.commandBus.execute(
      new SocialLoginCommand(dto.provider, dto.token),
    );
  }

  @Post("apple")
  apple(@Body() dto: SocialLoginDto) {
    return this.commandBus.execute(
      new SocialLoginCommand(dto.provider, dto.token),
    );
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() userId: string) {
    return this.queryBus.execute(new GetCurrentUserQuery(userId));
  }
}
```

### Step 30: Auth module wiring

- [ ] Create `apps/api/src/modules/auth/auth.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./presentation/auth.controller";
import { AuthDataService } from "./application/services/auth-data.service";
import { UserRepository } from "./infrastructure/repositories/user.repository";
import { USER_REPOSITORY } from "./domain/interfaces/user-repository.token";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { GoogleAuthService } from "./infrastructure/strategies/google.strategy";
import { AppleAuthService } from "./infrastructure/strategies/apple.strategy";
import { RegisterHandler } from "./application/commands/register.handler";
import { LoginHandler } from "./application/commands/login.handler";
import { RefreshTokenHandler } from "./application/commands/refresh-token.handler";
import { SocialLoginHandler } from "./application/commands/social-login.handler";
import { GetCurrentUserHandler } from "./application/queries/get-current-user.handler";

const CommandHandlers = [
  RegisterHandler,
  LoginHandler,
  RefreshTokenHandler,
  SocialLoginHandler,
];
const QueryHandlers = [GetCurrentUserHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "15m" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserRepository,
    { provide: USER_REPOSITORY, useExisting: UserRepository },
    AuthDataService,
    JwtStrategy,
    GoogleAuthService,
    AppleAuthService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AuthDataService, JwtStrategy, PassportModule],
})
export class AuthModule {}
```

---

## Phase 5: Azkar Module (Clean Architecture)

**Directory**: `apps/api/src/modules/azkar/`

### Step 31: Domain — ZikrEntity

- [ ] Create `apps/api/src/modules/azkar/domain/entities/zikr.entity.ts`

```typescript
export interface ZikrEntity {
  id: number;
  arabicText: string;
  arabicTextClean?: string | null;
  translationEn?: string | null;
  translationAr?: string | null;
  transliteration?: string | null;
  repeatCount: number;
  reference?: string | null;
  virtueAr?: string | null;
  virtueEn?: string | null;
  category: string;
  orderIndex: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Step 32: Domain — CounterPresetEntity

- [ ] Create `apps/api/src/modules/azkar/domain/entities/counter-preset.entity.ts`

```typescript
export interface CounterPresetEntity {
  id: string;
  labelAr: string;
  labelEn: string;
  targetCount: number;
  orderIndex: number;
  version: number;
}
```

### Step 33: Domain — ZIKR_REPOSITORY token

- [ ] Create `apps/api/src/modules/azkar/domain/interfaces/zikr-repository.token.ts`

```typescript
export const ZIKR_REPOSITORY = Symbol("ZIKR_REPOSITORY");
```

### Step 34: Domain — IZikrRepository

- [ ] Create `apps/api/src/modules/azkar/domain/interfaces/izikr.repository.ts`

```typescript
import { PrismaRepository } from "../../../../shared/repositories/prisma.repository";
import { ZikrEntity } from "../entities/zikr.entity";

export interface IZikrRepository extends PrismaRepository<ZikrEntity> {}
```

### Step 35: Infrastructure — ZikrRepository

- [ ] Create `apps/api/src/modules/azkar/infrastructure/repositories/zikr.repository.ts`

Same pattern as UserRepository — extends `PrismaRepository`, `getDelegate()` returns `this.prisma.zikr`.

### Step 36: Application — AzkarDataService

- [ ] Create `apps/api/src/modules/azkar/application/services/azkar-data.service.ts`

Methods:

- `getByCategory(category)` — find many where category, ordered by orderIndex asc
- `getAll()` — all azkar ordered by category + orderIndex
- `getById(id)` — find unique by id
- `getCounterPresets()` — all presets via `prisma.counterPreset` ordered by orderIndex
- `getContentVersion(key)` — lookup ContentVersion by key
- `seedAzkar(data)` — bulk create zikr rows + counter presets + content version entry

```typescript
@Injectable()
export class AzkarDataService {
  constructor(
    @Inject(ZIKR_REPOSITORY) private readonly zikrRepo: IZikrRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getByCategory(category: string) {
    return this.zikrRepo.findMany({
      where: { category },
      orderBy: { orderIndex: "asc" },
    });
  }

  async getAll() {
    return this.zikrRepo.findMany({
      orderBy: [{ category: "asc" }, { orderIndex: "asc" }],
    });
  }

  async getById(id: number) {
    return this.zikrRepo.findUnique({ where: { id } });
  }

  async getCounterPresets() {
    return this.prisma.counterPreset.findMany({
      orderBy: { orderIndex: "asc" },
    });
  }

  async getContentVersion(key: string) {
    return this.prisma.contentVersion.findUnique({ where: { key } });
  }

  // Used by SeedAzkarHandler — bulk inserts from @repo/data
  async seedAzkar(azkar: any[], presets: any[]) {
    await this.prisma.zikr.createMany({ data: azkar });
    await this.prisma.counterPreset.createMany({ data: presets });
    await this.prisma.contentVersion.create({
      data: { key: "azkar", version: 1 },
    });
  }
}
```

### Step 37: Application — GetAzkarByCategory query + handler

- [ ] Create `apps/api/src/modules/azkar/application/queries/get-azkar-by-category.query.ts`
- [ ] Create `apps/api/src/modules/azkar/application/queries/get-azkar-by-category.handler.ts`

**Query**: `GetAzkarByCategoryQuery(category)`
**Handler**: Calls `azkarData.getByCategory(category)`. Returns array of ZikrEntity.

### Step 38: Application — GetAzkarVersion query + handler

- [ ] Create `apps/api/src/modules/azkar/application/queries/get-azkar-version.query.ts`
- [ ] Create `apps/api/src/modules/azkar/application/queries/get-azkar-version.handler.ts`

**Query**: `GetAzkarVersionQuery()`
**Handler**: Calls `azkarData.getContentVersion('azkar')`. Returns `{ version: number }`.

### Step 39: Application — GetCounterPresets query + handler

- [ ] Create `apps/api/src/modules/azkar/application/queries/get-counter-presets.query.ts`
- [ ] Create `apps/api/src/modules/azkar/application/queries/get-counter-presets.handler.ts`

**Query**: `GetCounterPresetsQuery()`
**Handler**: Calls `azkarData.getCounterPresets()`. Returns array of CounterPresetEntity.

### Step 40: Application — SeedAzkar command + handler

- [ ] Create `apps/api/src/modules/azkar/application/commands/seed-azkar.command.ts`
- [ ] Create `apps/api/src/modules/azkar/application/commands/seed-azkar.handler.ts`

**Command**: `SeedAzkarCommand()`
**Handler**: Imports morning/evening/night JSON from `@repo/data`, imports counter presets, maps to DB shape, calls `azkarData.seedAzkar(azkar, presets)`.

```typescript
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SeedAzkarCommand } from "./seed-azkar.command";
import { AzkarDataService } from "../services/azkar-data.service";
// Import seed data from shared package
import morningAzkar from "@repo/data/azkar/morning.json";
import eveningAzkar from "@repo/data/azkar/evening.json";
import nightAzkar from "@repo/data/azkar/night.json";
import counterPresets from "@repo/data/counter/presets.json";

@CommandHandler(SeedAzkarCommand)
export class SeedAzkarHandler implements ICommandHandler<SeedAzkarCommand> {
  constructor(private readonly azkarData: AzkarDataService) {}

  async execute() {
    const allAzkar = [
      ...morningAzkar.map((z, i) => ({
        ...z,
        category: "morning",
        orderIndex: i,
      })),
      ...eveningAzkar.map((z, i) => ({
        ...z,
        category: "evening",
        orderIndex: i,
      })),
      ...nightAzkar.map((z, i) => ({ ...z, category: "night", orderIndex: i })),
    ];

    const presets = counterPresets.map((p, i) => ({ ...p, orderIndex: i }));

    await this.azkarData.seedAzkar(allAzkar, presets);
    return { seeded: allAzkar.length, presets: presets.length };
  }
}
```

### Step 41: Infrastructure — AzkarSeeder (OnModuleInit)

- [ ] Create `apps/api/src/modules/azkar/infrastructure/seeders/azkar.seeder.ts`

Runs on app startup. Checks if Zikr table is empty, if so dispatches `SeedAzkarCommand`:

```typescript
import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { PrismaService } from "../../../../prisma/prisma.service";
import { SeedAzkarCommand } from "../../application/commands/seed-azkar.command";

@Injectable()
export class AzkarSeeder implements OnModuleInit {
  private readonly logger = new Logger(AzkarSeeder.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  async onModuleInit() {
    const count = await this.prisma.zikr.count();
    if (count === 0) {
      this.logger.log("Zikr table empty — seeding azkar data...");
      const result = await this.commandBus.execute(new SeedAzkarCommand());
      this.logger.log(
        `Seeded ${result.seeded} azkar + ${result.presets} presets`,
      );
    }
  }
}
```

### Step 42: Presentation — AzkarController

- [ ] Create `apps/api/src/modules/azkar/presentation/azkar.controller.ts`

All endpoints are **public** (no auth required):

```typescript
import { Controller, Get, Query } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetAzkarByCategoryQuery } from "../application/queries/get-azkar-by-category.query";
import { GetAzkarVersionQuery } from "../application/queries/get-azkar-version.query";
import { GetCounterPresetsQuery } from "../application/queries/get-counter-presets.query";

@Controller("azkar")
export class AzkarController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  getByCategory(@Query("category") category: string) {
    return this.queryBus.execute(new GetAzkarByCategoryQuery(category));
  }

  @Get("version")
  getVersion() {
    return this.queryBus.execute(new GetAzkarVersionQuery());
  }

  @Get("all")
  getAll() {
    return this.queryBus.execute(new GetAzkarByCategoryQuery(null)); // handler returns all if null
  }
}

// Separate controller for counter-presets at /counter-presets
@Controller("counter-presets")
export class CounterPresetsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  getAll() {
    return this.queryBus.execute(new GetCounterPresetsQuery());
  }
}
```

### Step 43: Azkar module wiring

- [ ] Create `apps/api/src/modules/azkar/azkar.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import {
  AzkarController,
  CounterPresetsController,
} from "./presentation/azkar.controller";
import { AzkarDataService } from "./application/services/azkar-data.service";
import { ZikrRepository } from "./infrastructure/repositories/zikr.repository";
import { ZIKR_REPOSITORY } from "./domain/interfaces/zikr-repository.token";
import { AzkarSeeder } from "./infrastructure/seeders/azkar.seeder";
import { SeedAzkarHandler } from "./application/commands/seed-azkar.handler";
import { GetAzkarByCategoryHandler } from "./application/queries/get-azkar-by-category.handler";
import { GetAzkarVersionHandler } from "./application/queries/get-azkar-version.handler";
import { GetCounterPresetsHandler } from "./application/queries/get-counter-presets.handler";

const CommandHandlers = [SeedAzkarHandler];
const QueryHandlers = [
  GetAzkarByCategoryHandler,
  GetAzkarVersionHandler,
  GetCounterPresetsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [AzkarController, CounterPresetsController],
  providers: [
    ZikrRepository,
    { provide: ZIKR_REPOSITORY, useExisting: ZikrRepository },
    AzkarDataService,
    AzkarSeeder,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AzkarDataService],
})
export class AzkarModule {}
```

---

## Phase 6: Progress Module (Clean Architecture)

**Directory**: `apps/api/src/modules/progress/`

### Step 44: Domain layer

- [ ] Create `apps/api/src/modules/progress/domain/entities/daily-progress.entity.ts` — DailyProgressEntity interface
- [ ] Create `apps/api/src/modules/progress/domain/entities/streak.entity.ts` — StreakEntity interface
- [ ] Create `apps/api/src/modules/progress/domain/interfaces/progress-repository.token.ts` — `PROGRESS_REPOSITORY` Symbol
- [ ] Create `apps/api/src/modules/progress/domain/interfaces/iprogress.repository.ts` — `IProgressRepository extends PrismaRepository<DailyProgressEntity>`

Same pattern as auth/azkar domain layers.

### Step 45: Infrastructure — ProgressRepository

- [ ] Create `apps/api/src/modules/progress/infrastructure/repositories/progress.repository.ts`

Extends `PrismaRepository`, `getDelegate()` returns `this.prisma.dailyProgress`. Also accesses `this.prisma.streak` directly for streak operations.

### Step 46: Application — ProgressDataService

- [ ] Create `apps/api/src/modules/progress/application/services/progress-data.service.ts`

Methods:

- `getByDateAndUser(userId, date)` — find all DailyProgress for user+date (all categories)
- `upsertProgress(userId, date, category, completedIds, inProgress)` — upsert using unique constraint `[userId, date, category]`
- `getStreak(userId)` — find streak record for user
- `updateStreak(userId, date)` — check if lastDate is yesterday → increment, else reset to 1

```typescript
async updateStreak(userId: string, date: string) {
  const streak = await this.prisma.streak.findUnique({ where: { userId } });
  const yesterday = /* compute yesterday from date */;

  if (!streak) {
    return this.prisma.streak.create({ data: { userId, count: 1, lastDate: date } });
  }

  if (streak.lastDate === date) return streak; // Already updated today

  const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
  return this.prisma.streak.update({
    where: { userId },
    data: { count: newCount, lastDate: date },
  });
}
```

### Step 47: Application — Commands

- [ ] Create `apps/api/src/modules/progress/application/commands/upsert-progress.command.ts` + `upsert-progress.handler.ts`
  - **Command**: `UpsertProgressCommand(userId, date, category, completedIds, inProgress)`
  - **Handler**: Calls `progressData.upsertProgress(...)`, then dispatches `UpdateStreakCommand`

- [ ] Create `apps/api/src/modules/progress/application/commands/update-streak.command.ts` + `update-streak.handler.ts`
  - **Command**: `UpdateStreakCommand(userId, date)`
  - **Handler**: Calls `progressData.updateStreak(...)`

### Step 48: Application — Queries

- [ ] Create `apps/api/src/modules/progress/application/queries/get-daily-progress.query.ts` + `get-daily-progress.handler.ts`
  - **Query**: `GetDailyProgressQuery(userId, date)`
  - **Handler**: Returns all progress entries for the given user+date

- [ ] Create `apps/api/src/modules/progress/application/queries/get-streak.query.ts` + `get-streak.handler.ts`
  - **Query**: `GetStreakQuery(userId)`
  - **Handler**: Returns streak record `{ count, lastDate }`

### Step 49: Presentation — ProgressController

- [ ] Create `apps/api/src/modules/progress/presentation/progress.controller.ts`

All endpoints **protected** with `@UseGuards(JwtAuthGuard)`:

```typescript
@Controller("progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getProgress(@CurrentUser() userId: string, @Query("date") date: string) {
    return this.queryBus.execute(new GetDailyProgressQuery(userId, date));
  }

  @Put()
  upsertProgress(
    @CurrentUser() userId: string,
    @Body() body: UpsertProgressDto,
  ) {
    return this.commandBus.execute(
      new UpsertProgressCommand(
        userId,
        body.date,
        body.category,
        body.completedIds,
        body.inProgress,
      ),
    );
  }

  @Get("streak")
  getStreak(@CurrentUser() userId: string) {
    return this.queryBus.execute(new GetStreakQuery(userId));
  }
}
```

### Step 50: Progress module wiring

- [ ] Create `apps/api/src/modules/progress/progress.module.ts`

Same pattern as previous modules — imports `CqrsModule`, registers repository + token binding, data service, all handlers, seeder (none for progress), controller.

---

## Phase 7: Counter Module (Clean Architecture)

**Directory**: `apps/api/src/modules/counter/`

### Step 51: Domain layer

- [ ] Create `apps/api/src/modules/counter/domain/entities/counter-state.entity.ts` — CounterStateEntity interface
- [ ] Create `apps/api/src/modules/counter/domain/interfaces/counter-repository.token.ts` — `COUNTER_REPOSITORY` Symbol
- [ ] Create `apps/api/src/modules/counter/domain/interfaces/icounter.repository.ts` — `ICounterRepository extends PrismaRepository<CounterStateEntity>`

### Step 52: Infrastructure — CounterRepository

- [ ] Create `apps/api/src/modules/counter/infrastructure/repositories/counter.repository.ts`

`getDelegate()` returns `this.prisma.counterState`.

### Step 53: Application — CounterDataService

- [ ] Create `apps/api/src/modules/counter/application/services/counter-data.service.ts`

Methods:

- `getByUserId(userId)` — find unique by userId
- `saveState(userId, current, target, presetId?, customLabel?)` — upsert counter state

### Step 54: Application — Command + Query

- [ ] Create `apps/api/src/modules/counter/application/commands/save-counter.command.ts` + `save-counter.handler.ts`
  - **Command**: `SaveCounterCommand(userId, current, target, presetId?, customLabel?)`
  - **Handler**: Calls `counterData.saveState(...)`

- [ ] Create `apps/api/src/modules/counter/application/queries/get-counter.query.ts` + `get-counter.handler.ts`
  - **Query**: `GetCounterQuery(userId)`
  - **Handler**: Calls `counterData.getByUserId(...)`, returns state or default `{ current: 0, target: 33 }`

### Step 55: Presentation — CounterController

- [ ] Create `apps/api/src/modules/counter/presentation/counter.controller.ts`

Protected endpoints:

```typescript
@Controller("counter")
@UseGuards(JwtAuthGuard)
export class CounterController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  get(@CurrentUser() userId: string) {
    return this.queryBus.execute(new GetCounterQuery(userId));
  }

  @Put()
  save(@CurrentUser() userId: string, @Body() body: SaveCounterDto) {
    return this.commandBus.execute(
      new SaveCounterCommand(
        userId,
        body.current,
        body.target,
        body.presetId,
        body.customLabel,
      ),
    );
  }
}
```

### Step 56: Counter module wiring

- [ ] Create `apps/api/src/modules/counter/counter.module.ts`

Same pattern — CqrsModule, repository + token, data service, handlers, controller.

---

## Phase 8: Favorites Module (Clean Architecture)

**Directory**: `apps/api/src/modules/favorites/`

### Step 57: Domain layer

- [ ] Create `apps/api/src/modules/favorites/domain/entities/favorite.entity.ts` — FavoriteEntity interface
- [ ] Create `apps/api/src/modules/favorites/domain/interfaces/favorite-repository.token.ts` — `FAVORITE_REPOSITORY` Symbol
- [ ] Create `apps/api/src/modules/favorites/domain/interfaces/ifavorite.repository.ts` — `IFavoriteRepository extends PrismaRepository<FavoriteEntity>`

### Step 58: Infrastructure — FavoriteRepository

- [ ] Create `apps/api/src/modules/favorites/infrastructure/repositories/favorite.repository.ts`

`getDelegate()` returns `this.prisma.favorite`.

### Step 59: Application — FavoritesDataService

- [ ] Create `apps/api/src/modules/favorites/application/services/favorites-data.service.ts`

Methods:

- `getByUserId(userId)` — find many where userId, include zikr relation if needed
- `addFavorite(userId, zikrId)` — create favorite (unique constraint prevents duplicates)
- `removeFavorite(userId, zikrId)` — delete where userId+zikrId

### Step 60: Application — Commands + Query

- [ ] Create `apps/api/src/modules/favorites/application/commands/add-favorite.command.ts` + `add-favorite.handler.ts`
  - **Command**: `AddFavoriteCommand(userId, zikrId)`
  - **Handler**: Calls `favoritesData.addFavorite(...)`. Catches unique constraint error → no-op.

- [ ] Create `apps/api/src/modules/favorites/application/commands/remove-favorite.command.ts` + `remove-favorite.handler.ts`
  - **Command**: `RemoveFavoriteCommand(userId, zikrId)`
  - **Handler**: Calls `favoritesData.removeFavorite(...)`

- [ ] Create `apps/api/src/modules/favorites/application/queries/get-favorites.query.ts` + `get-favorites.handler.ts`
  - **Query**: `GetFavoritesQuery(userId)`
  - **Handler**: Returns list of favorites with zikr data

### Step 61: Presentation — FavoritesController

- [ ] Create `apps/api/src/modules/favorites/presentation/favorites.controller.ts`

Protected endpoints:

```typescript
@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getAll(@CurrentUser() userId: string) {
    return this.queryBus.execute(new GetFavoritesQuery(userId));
  }

  @Post(":zikrId")
  add(
    @CurrentUser() userId: string,
    @Param("zikrId", ParseIntPipe) zikrId: number,
  ) {
    return this.commandBus.execute(new AddFavoriteCommand(userId, zikrId));
  }

  @Delete(":zikrId")
  remove(
    @CurrentUser() userId: string,
    @Param("zikrId", ParseIntPipe) zikrId: number,
  ) {
    return this.commandBus.execute(new RemoveFavoriteCommand(userId, zikrId));
  }
}
```

### Step 62: Favorites module wiring

- [ ] Create `apps/api/src/modules/favorites/favorites.module.ts`

Same pattern — CqrsModule, repository + token, data service, handlers, controller.

---

## Phase 9: Preferences Module (Clean Architecture)

**Directory**: `apps/api/src/modules/preferences/`

### Step 63: Domain layer

- [ ] Create `apps/api/src/modules/preferences/domain/entities/preferences.entity.ts` — PreferencesEntity interface
- [ ] Create `apps/api/src/modules/preferences/domain/interfaces/preferences-repository.token.ts` — `PREFERENCES_REPOSITORY` Symbol
- [ ] Create `apps/api/src/modules/preferences/domain/interfaces/ipreferences.repository.ts` — `IPreferencesRepository extends PrismaRepository<PreferencesEntity>`

### Step 64: Infrastructure — PreferencesRepository

- [ ] Create `apps/api/src/modules/preferences/infrastructure/repositories/preferences.repository.ts`

`getDelegate()` returns `this.prisma.userPreferences`.

### Step 65: Application — PreferencesDataService

- [ ] Create `apps/api/src/modules/preferences/application/services/preferences-data.service.ts`

Methods:

- `getByUserId(userId)` — find unique where userId
- `updatePreferences(userId, data)` — upsert (create defaults if not exists, update partial fields)

### Step 66: Application — Command + Query

- [ ] Create `apps/api/src/modules/preferences/application/commands/update-preferences.command.ts` + `update-preferences.handler.ts`
  - **Command**: `UpdatePreferencesCommand(userId, data)` where data is partial `{ language?, theme?, counterMode?, soundEnabled?, vibrationEnabled? }`
  - **Handler**: Calls `preferencesData.updatePreferences(...)`

- [ ] Create `apps/api/src/modules/preferences/application/queries/get-preferences.query.ts` + `get-preferences.handler.ts`
  - **Query**: `GetPreferencesQuery(userId)`
  - **Handler**: Returns preferences or creates defaults if not found

### Step 67: Presentation — PreferencesController

- [ ] Create `apps/api/src/modules/preferences/presentation/preferences.controller.ts`

Protected endpoints:

```typescript
@Controller("preferences")
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  get(@CurrentUser() userId: string) {
    return this.queryBus.execute(new GetPreferencesQuery(userId));
  }

  @Patch()
  update(@CurrentUser() userId: string, @Body() body: UpdatePreferencesDto) {
    return this.commandBus.execute(new UpdatePreferencesCommand(userId, body));
  }
}
```

### Step 68: Preferences module wiring

- [ ] Create `apps/api/src/modules/preferences/preferences.module.ts`

Same pattern — CqrsModule, repository + token, data service, handlers, controller.

---

## Phase 10: App Module Wiring

### Step 69: Update app.module.ts

- [ ] Update `apps/api/src/app.module.ts`

Import PrismaModule (global) + ConfigModule + all 6 domain modules:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AzkarModule } from "./modules/azkar/azkar.module";
import { ProgressModule } from "./modules/progress/progress.module";
import { CounterModule } from "./modules/counter/counter.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { PreferencesModule } from "./modules/preferences/preferences.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule.forRoot(),
    PrismaModule,
    AuthModule,
    AzkarModule,
    ProgressModule,
    CounterModule,
    FavoritesModule,
    PreferencesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Step 70: Update main.ts

- [ ] Update `apps/api/src/main.ts`

Add global validation pipe, response interceptor, exception filter, API prefix, CORS config:

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix("api/v1");

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Response wrapper
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Exception handler
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors({
    origin: [
      "http://localhost:3000", // Next.js web
      "http://localhost:3002", // Storybook or other dev tools
    ],
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();
```

---

## Verification

### Step 71: Database + startup check

- [ ] Run `npx prisma migrate dev` — verify all tables created
- [ ] Run `pnpm dev` in `apps/api/` — verify server starts on port 3001
- [ ] Verify seeder runs: check logs for "Seeded X azkar + Y presets"
- [ ] Verify `GET http://localhost:3001/api/v1` returns health/hello response

### Step 72: Auth flow

- [ ] `POST /api/v1/auth/register` with `{ email, password, name }` → returns `{ accessToken, refreshToken }`
- [ ] `POST /api/v1/auth/login` with `{ email, password }` → returns tokens
- [ ] `POST /api/v1/auth/refresh` with `{ refreshToken }` → returns new token pair
- [ ] `GET /api/v1/auth/me` with `Authorization: Bearer <token>` → returns user profile
- [ ] Verify duplicate email registration returns 409 Conflict
- [ ] Verify invalid credentials returns 401 Unauthorized

### Step 73: Azkar seeding + retrieval

- [ ] `GET /api/v1/azkar?category=morning` → returns morning azkar array
- [ ] `GET /api/v1/azkar?category=evening` → returns evening azkar array
- [ ] `GET /api/v1/azkar?category=night` → returns night azkar array
- [ ] `GET /api/v1/azkar/all` → returns all azkar
- [ ] `GET /api/v1/azkar/version` → returns `{ version: 1 }`
- [ ] `GET /api/v1/counter-presets` → returns counter presets array
- [ ] Verify all responses wrapped in `{ success: true, data: ... }`

### Step 74: CRUD operations

- [ ] **Progress**: `PUT /api/v1/progress` with body → upserts, `GET /api/v1/progress?date=2026-02-12` → returns entries, `GET /api/v1/progress/streak` → returns streak
- [ ] **Counter**: `PUT /api/v1/counter` → saves state, `GET /api/v1/counter` → returns state
- [ ] **Favorites**: `POST /api/v1/favorites/1` → adds, `GET /api/v1/favorites` → lists, `DELETE /api/v1/favorites/1` → removes
- [ ] **Preferences**: `PATCH /api/v1/preferences` with partial body → updates, `GET /api/v1/preferences` → returns preferences
- [ ] Verify all protected endpoints return 401 without token
- [ ] Verify all protected endpoints work with valid JWT

---

## File Index (Complete List)

All paths relative to `apps/api/src/`:

| #   | File                                                                        | Description                                                     |
| --- | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | `prisma/schema.prisma` (in `apps/api/prisma/`)                              | Full Prisma 7 schema — 10 models                                |
| 2   | `prisma/prisma.service.ts`                                                  | PrismaClient + PrismaPg adapter + pg.Pool                       |
| 3   | `prisma/prisma.module.ts`                                                   | Global PrismaModule                                             |
| 4   | `shared/repositories/irepository.interface.ts`                              | Base IRepository interface                                      |
| 5   | `shared/repositories/prisma.repository.ts`                                  | Abstract PrismaRepository\<T\> base                             |
| 6   | `common/decorators/current-user.decorator.ts`                               | @CurrentUser() param decorator                                  |
| 7   | `common/guards/jwt-auth.guard.ts`                                           | JWT AuthGuard                                                   |
| 8   | `common/guards/optional-auth.guard.ts`                                      | Optional JWT guard                                              |
| 9   | `common/interceptors/response.interceptor.ts`                               | Wraps responses in { success, data }                            |
| 10  | `common/filters/http-exception.filter.ts`                                   | Standard error format                                           |
| 11  | `modules/auth/domain/entities/user.entity.ts`                               | UserEntity interface                                            |
| 12  | `modules/auth/domain/interfaces/user-repository.token.ts`                   | USER_REPOSITORY Symbol                                          |
| 13  | `modules/auth/domain/interfaces/iuser.repository.ts`                        | IUserRepository interface                                       |
| 14  | `modules/auth/infrastructure/repositories/user.repository.ts`               | UserRepository (Prisma)                                         |
| 15  | `modules/auth/infrastructure/strategies/jwt.strategy.ts`                    | Passport JWT Strategy                                           |
| 16  | `modules/auth/infrastructure/strategies/google.strategy.ts`                 | Google OAuth service                                            |
| 17  | `modules/auth/infrastructure/strategies/apple.strategy.ts`                  | Apple OAuth service                                             |
| 18  | `modules/auth/application/dto/register.dto.ts`                              | RegisterDto                                                     |
| 19  | `modules/auth/application/dto/login.dto.ts`                                 | LoginDto                                                        |
| 20  | `modules/auth/application/dto/social-login.dto.ts`                          | SocialLoginDto                                                  |
| 21  | `modules/auth/application/services/auth-data.service.ts`                    | AuthDataService                                                 |
| 22  | `modules/auth/application/commands/register.command.ts`                     | RegisterCommand                                                 |
| 23  | `modules/auth/application/commands/register.handler.ts`                     | RegisterHandler                                                 |
| 24  | `modules/auth/application/commands/login.command.ts`                        | LoginCommand                                                    |
| 25  | `modules/auth/application/commands/login.handler.ts`                        | LoginHandler                                                    |
| 26  | `modules/auth/application/commands/refresh-token.command.ts`                | RefreshTokenCommand                                             |
| 27  | `modules/auth/application/commands/refresh-token.handler.ts`                | RefreshTokenHandler                                             |
| 28  | `modules/auth/application/commands/social-login.command.ts`                 | SocialLoginCommand                                              |
| 29  | `modules/auth/application/commands/social-login.handler.ts`                 | SocialLoginHandler                                              |
| 30  | `modules/auth/application/queries/get-current-user.query.ts`                | GetCurrentUserQuery                                             |
| 31  | `modules/auth/application/queries/get-current-user.handler.ts`              | GetCurrentUserHandler                                           |
| 32  | `modules/auth/presentation/auth.controller.ts`                              | AuthController (6 endpoints)                                    |
| 33  | `modules/auth/auth.module.ts`                                               | AuthModule wiring                                               |
| 34  | `modules/azkar/domain/entities/zikr.entity.ts`                              | ZikrEntity interface                                            |
| 35  | `modules/azkar/domain/entities/counter-preset.entity.ts`                    | CounterPresetEntity interface                                   |
| 36  | `modules/azkar/domain/interfaces/zikr-repository.token.ts`                  | ZIKR_REPOSITORY Symbol                                          |
| 37  | `modules/azkar/domain/interfaces/izikr.repository.ts`                       | IZikrRepository interface                                       |
| 38  | `modules/azkar/infrastructure/repositories/zikr.repository.ts`              | ZikrRepository (Prisma)                                         |
| 39  | `modules/azkar/infrastructure/seeders/azkar.seeder.ts`                      | AzkarSeeder (OnModuleInit)                                      |
| 40  | `modules/azkar/application/services/azkar-data.service.ts`                  | AzkarDataService                                                |
| 41  | `modules/azkar/application/commands/seed-azkar.command.ts`                  | SeedAzkarCommand                                                |
| 42  | `modules/azkar/application/commands/seed-azkar.handler.ts`                  | SeedAzkarHandler                                                |
| 43  | `modules/azkar/application/queries/get-azkar-by-category.query.ts`          | Query                                                           |
| 44  | `modules/azkar/application/queries/get-azkar-by-category.handler.ts`        | Handler                                                         |
| 45  | `modules/azkar/application/queries/get-azkar-version.query.ts`              | Query                                                           |
| 46  | `modules/azkar/application/queries/get-azkar-version.handler.ts`            | Handler                                                         |
| 47  | `modules/azkar/application/queries/get-counter-presets.query.ts`            | Query                                                           |
| 48  | `modules/azkar/application/queries/get-counter-presets.handler.ts`          | Handler                                                         |
| 49  | `modules/azkar/presentation/azkar.controller.ts`                            | AzkarController + CounterPresetsController                      |
| 50  | `modules/azkar/azkar.module.ts`                                             | AzkarModule wiring                                              |
| 51  | `modules/progress/domain/entities/daily-progress.entity.ts`                 | DailyProgressEntity                                             |
| 52  | `modules/progress/domain/entities/streak.entity.ts`                         | StreakEntity                                                    |
| 53  | `modules/progress/domain/interfaces/progress-repository.token.ts`           | PROGRESS_REPOSITORY Symbol                                      |
| 54  | `modules/progress/domain/interfaces/iprogress.repository.ts`                | IProgressRepository                                             |
| 55  | `modules/progress/infrastructure/repositories/progress.repository.ts`       | ProgressRepository                                              |
| 56  | `modules/progress/application/services/progress-data.service.ts`            | ProgressDataService                                             |
| 57  | `modules/progress/application/commands/upsert-progress.command.ts`          | Command                                                         |
| 58  | `modules/progress/application/commands/upsert-progress.handler.ts`          | Handler                                                         |
| 59  | `modules/progress/application/commands/update-streak.command.ts`            | Command                                                         |
| 60  | `modules/progress/application/commands/update-streak.handler.ts`            | Handler                                                         |
| 61  | `modules/progress/application/queries/get-daily-progress.query.ts`          | Query                                                           |
| 62  | `modules/progress/application/queries/get-daily-progress.handler.ts`        | Handler                                                         |
| 63  | `modules/progress/application/queries/get-streak.query.ts`                  | Query                                                           |
| 64  | `modules/progress/application/queries/get-streak.handler.ts`                | Handler                                                         |
| 65  | `modules/progress/presentation/progress.controller.ts`                      | ProgressController                                              |
| 66  | `modules/progress/progress.module.ts`                                       | ProgressModule                                                  |
| 67  | `modules/counter/domain/entities/counter-state.entity.ts`                   | CounterStateEntity                                              |
| 68  | `modules/counter/domain/interfaces/counter-repository.token.ts`             | COUNTER_REPOSITORY Symbol                                       |
| 69  | `modules/counter/domain/interfaces/icounter.repository.ts`                  | ICounterRepository                                              |
| 70  | `modules/counter/infrastructure/repositories/counter.repository.ts`         | CounterRepository                                               |
| 71  | `modules/counter/application/services/counter-data.service.ts`              | CounterDataService                                              |
| 72  | `modules/counter/application/commands/save-counter.command.ts`              | Command                                                         |
| 73  | `modules/counter/application/commands/save-counter.handler.ts`              | Handler                                                         |
| 74  | `modules/counter/application/queries/get-counter.query.ts`                  | Query                                                           |
| 75  | `modules/counter/application/queries/get-counter.handler.ts`                | Handler                                                         |
| 76  | `modules/counter/presentation/counter.controller.ts`                        | CounterController                                               |
| 77  | `modules/counter/counter.module.ts`                                         | CounterModule                                                   |
| 78  | `modules/favorites/domain/entities/favorite.entity.ts`                      | FavoriteEntity                                                  |
| 79  | `modules/favorites/domain/interfaces/favorite-repository.token.ts`          | FAVORITE_REPOSITORY Symbol                                      |
| 80  | `modules/favorites/domain/interfaces/ifavorite.repository.ts`               | IFavoriteRepository                                             |
| 81  | `modules/favorites/infrastructure/repositories/favorite.repository.ts`      | FavoriteRepository                                              |
| 82  | `modules/favorites/application/services/favorites-data.service.ts`          | FavoritesDataService                                            |
| 83  | `modules/favorites/application/commands/add-favorite.command.ts`            | Command                                                         |
| 84  | `modules/favorites/application/commands/add-favorite.handler.ts`            | Handler                                                         |
| 85  | `modules/favorites/application/commands/remove-favorite.command.ts`         | Command                                                         |
| 86  | `modules/favorites/application/commands/remove-favorite.handler.ts`         | Handler                                                         |
| 87  | `modules/favorites/application/queries/get-favorites.query.ts`              | Query                                                           |
| 88  | `modules/favorites/application/queries/get-favorites.handler.ts`            | Handler                                                         |
| 89  | `modules/favorites/presentation/favorites.controller.ts`                    | FavoritesController                                             |
| 90  | `modules/favorites/favorites.module.ts`                                     | FavoritesModule                                                 |
| 91  | `modules/preferences/domain/entities/preferences.entity.ts`                 | PreferencesEntity                                               |
| 92  | `modules/preferences/domain/interfaces/preferences-repository.token.ts`     | PREFERENCES_REPOSITORY Symbol                                   |
| 93  | `modules/preferences/domain/interfaces/ipreferences.repository.ts`          | IPreferencesRepository                                          |
| 94  | `modules/preferences/infrastructure/repositories/preferences.repository.ts` | PreferencesRepository                                           |
| 95  | `modules/preferences/application/services/preferences-data.service.ts`      | PreferencesDataService                                          |
| 96  | `modules/preferences/application/commands/update-preferences.command.ts`    | Command                                                         |
| 97  | `modules/preferences/application/commands/update-preferences.handler.ts`    | Handler                                                         |
| 98  | `modules/preferences/application/queries/get-preferences.query.ts`          | Query                                                           |
| 99  | `modules/preferences/application/queries/get-preferences.handler.ts`        | Handler                                                         |
| 100 | `modules/preferences/presentation/preferences.controller.ts`                | PreferencesController                                           |
| 101 | `modules/preferences/preferences.module.ts`                                 | PreferencesModule                                               |
| 102 | `app.module.ts`                                                             | **Updated** — imports all modules                               |
| 103 | `main.ts`                                                                   | **Updated** — global pipes, interceptors, filters, CORS, prefix |

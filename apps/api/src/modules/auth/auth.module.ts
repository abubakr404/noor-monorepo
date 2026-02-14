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

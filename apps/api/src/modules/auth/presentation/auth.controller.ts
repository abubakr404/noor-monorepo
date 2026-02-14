import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RegisterDto } from "../application/dto/register.dto";
import { LoginDto } from "../application/dto/login.dto";
import { SocialLoginDto } from "../application/dto/social-login.dto";
import { RefreshTokenDto } from "../application/dto/refresh-token.dto";
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
    return this.commandBus.execute(
      new LoginCommand(dto.email, dto.password),
    );
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.commandBus.execute(
      new RefreshTokenCommand(dto.refreshToken),
    );
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

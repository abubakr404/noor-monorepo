import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

interface JwtPayload {
  userId: string;
  email: string;
}

function isJwtPayload(user: unknown): user is JwtPayload {
  return (
    typeof user === "object" &&
    user !== null &&
    "userId" in user &&
    typeof (user as Record<string, unknown>).userId === "string"
  );
}

/**
 * Extracts the authenticated user's ID (or a specific field) from the JWT payload.
 * Usage: @CurrentUser() userId: string
 * Usage: @CurrentUser('email') email: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user || !isJwtPayload(user)) return null;
    return data ? user[data] : user.userId;
  },
);

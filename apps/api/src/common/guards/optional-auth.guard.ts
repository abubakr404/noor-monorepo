import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

/**
 * Allows unauthenticated access — attaches user if JWT present,
 * does not throw if absent.
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = unknown>(_err: Error | null, user: TUser | false): TUser | null {
    return user || null;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}

import { Injectable, Logger } from "@nestjs/common";
import appleSignin from "apple-signin-auth";

interface ApplePayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
}

@Injectable()
export class AppleAuthService {
  private readonly logger = new Logger(AppleAuthService.name);

  async verifyToken(identityToken: string): Promise<ApplePayload | null> {
    try {
      const payload = await appleSignin.verifyIdToken(identityToken, {
        audience: process.env.APPLE_CLIENT_ID,
      });
      return payload as ApplePayload;
    } catch (error) {
      this.logger.error(
        "Apple token verification failed",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }
}

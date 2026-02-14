import { Injectable, Logger } from "@nestjs/common";
import { OAuth2Client, TokenPayload } from "google-auth-library";

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verifyToken(idToken: string): Promise<TokenPayload | undefined> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (error) {
      this.logger.error(
        "Google token verification failed",
        error instanceof Error ? error.message : String(error),
      );
      return undefined;
    }
  }
}

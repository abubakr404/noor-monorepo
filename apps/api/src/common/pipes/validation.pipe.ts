import { ValidationPipe as NestValidationPipe } from "@nestjs/common";

/**
 * Pre-configured validation pipe for the app.
 * Strips unknown properties, transforms payloads, and provides detailed errors.
 */
export const validationPipe = new NestValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
});

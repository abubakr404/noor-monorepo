import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

interface ErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string;
    error: string;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null &&
        !Array.isArray(exceptionResponse)
      ) {
        const resp = exceptionResponse as Record<string, unknown>;
        const rawMessage = resp.message;
        message =
          typeof rawMessage === "string"
            ? rawMessage
            : Array.isArray(rawMessage)
              ? rawMessage.join(", ")
              : "An error occurred";
        error =
          typeof resp.error === "string" ? resp.error : "Error";
      } else {
        message = "An error occurred";
        error = "Error";
      }
    } else {
      message = "Internal server error";
      error = "Internal Server Error";
      this.logger.error("Unhandled exception", exception instanceof Error ? exception.stack : String(exception));
    }

    const body: ErrorResponse = {
      success: false,
      error: {
        statusCode: status,
        message,
        error,
      },
    };

    response.status(status).json(body);
  }
}

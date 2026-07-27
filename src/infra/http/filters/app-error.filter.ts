import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { Response } from "express";
import { AppError, HttpStatus } from "@/core/errors";

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      response.status(exception.statusCode).json(exception.toJSON());
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json(typeof body === "string" ? { error: exception.name, message: body } : body);
      return;
    }

    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL).json({
      error: "INTERNAL_ERROR",
      message: "Unexpected internal error"
    });
  }
}

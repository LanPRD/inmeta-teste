import { AppError, HttpStatus } from "@/core/errors";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger
} from "@nestjs/common";
import type { FastifyReply } from "fastify";

@Catch()
export class AppErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (exception instanceof AppError) {
      response.status(exception.statusCode).send(exception.toJSON());
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response
        .status(status)
        .send(
          typeof body === "string" ?
            { error: exception.name, message: body }
          : body
        );
      return;
    }

    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL).send({
      error: "INTERNAL_ERROR",
      message: "Unexpected internal error"
    });
  }
}

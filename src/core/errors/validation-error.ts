import { HttpStatus } from "../http-status";
import { AppError } from "./app-error";

export class ValidationError extends AppError {
  constructor(message: string) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", message);
  }
}

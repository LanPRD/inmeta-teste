import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from "@nestjs/common";
import type { ZodType } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const details = result.error.issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }));

      throw new BadRequestException({
        error: "VALIDATION_ERROR",
        message: "Validation failed",
        details
      });
    }

    return result.data;
  }
}

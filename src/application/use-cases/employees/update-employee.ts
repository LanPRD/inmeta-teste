import {
  UpdateEmployeeSchema,
  type UpdateEmployeeDto
} from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import {
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError
} from "@/core/errors";
import { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";
import { Injectable, Logger } from "@nestjs/common";

type UpdateEmployeeUseCaseResponse = Either<
  ValidationError | NotFoundError | ConflictError | InternalError,
  { employee: Employee }
>;

@Injectable()
export class UpdateEmployeeUseCase {
  private readonly logger = new Logger(UpdateEmployeeUseCase.name);

  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(
    employeeId: string,
    input: UpdateEmployeeDto
  ): Promise<UpdateEmployeeUseCaseResponse> {
    try {
      const parsed = UpdateEmployeeSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid update data"));
      }

      const existing = await this.employeeRepository.findById(employeeId);

      if (!existing) {
        return left(new NotFoundError("Employee", employeeId));
      }

      const updated = Employee.create(
        {
          name: parsed.data.name ?? existing.name,
          email: parsed.data.email ?? existing.email,
          createdAt: existing.createdAt
        },
        existing.id
      );

      await this.employeeRepository.update(updated);

      return right({ employee: updated });
    } catch (error) {
      if (error instanceof ConflictError) {
        return left(error);
      }

      this.logger.error("Failed to update employee", error);
      return left(new InternalError("Failed to update employee"));
    }
  }
}

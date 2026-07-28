import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import { EmployeeRepository } from "@/domain/repositories";
import { Injectable, Logger } from "@nestjs/common";

type DeleteEmployeeUseCaseResponse = Either<
  ValidationError | NotFoundError | InternalError,
  void
>;

@Injectable()
export class DeleteEmployeeUseCase {
  private readonly logger = new Logger(DeleteEmployeeUseCase.name);

  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(employeeId: string): Promise<DeleteEmployeeUseCaseResponse> {
    try {
      if (!employeeId) {
        return left(new ValidationError("Employee ID is required"));
      }

      const existing = await this.employeeRepository.findById(employeeId);

      if (!existing) {
        return left(new NotFoundError("Employee", employeeId));
      }

      await this.employeeRepository.delete(employeeId);

      return right(undefined);
    } catch (error) {
      this.logger.error("Failed to delete employee", error);
      return left(new InternalError("Failed to delete employee"));
    }
  }
}

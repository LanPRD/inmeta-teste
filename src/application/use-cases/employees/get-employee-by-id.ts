import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import type { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";
import { Injectable, Logger } from "@nestjs/common";

type GetEmployeeByIdUseCaseResponse = Either<
  ValidationError | NotFoundError | InternalError,
  {
    employee: Employee;
  }
>;

@Injectable()
export class GetEmployeeByIdUseCase {
  private readonly logger = new Logger(GetEmployeeByIdUseCase.name);

  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(employeeId: string): Promise<GetEmployeeByIdUseCaseResponse> {
    try {
      if (!employeeId) {
        return left(new ValidationError("Employee ID is required"));
      }

      const employee = await this.employeeRepository.findById(employeeId);

      if (!employee) {
        return left(new NotFoundError("Employee", employeeId));
      }

      return right({ employee });
    } catch (error) {
      this.logger.error("Failed to get employee by ID", error);
      return left(new InternalError("Failed to get employee by ID"));
    }
  }
}

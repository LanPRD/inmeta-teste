import { left, right, type Either } from "@/core/either";
import type { Employee } from "@/domain/entities";
import type { EmployeeRepository } from "@/domain/repositories";
import { Injectable, Logger } from "@nestjs/common";

type GetEmployeeByIdUseCaseResponse = Either<
  Error,
  {
    employee: Employee | null;
  }
>;

@Injectable()
export class GetEmployeeByIdUseCase {
  private readonly logger = new Logger(GetEmployeeByIdUseCase.name);

  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(employeeId: string): Promise<GetEmployeeByIdUseCaseResponse> {
    try {
      const employee = await this.employeeRepository.findById(employeeId);
      return right({ employee });
    } catch (error) {
      this.logger.error("Failed to get employee by ID", error);
      return left(new Error("Failed to get employee by ID"));
    }
  }
}

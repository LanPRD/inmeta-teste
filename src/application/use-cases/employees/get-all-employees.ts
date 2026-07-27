import { left, right, type Either } from "@/core/either";
import { InternalError } from "@/core/errors";
import type { Employee } from "@/domain/entities";
import type { EmployeeRepository } from "@/domain/repositories";
import { Injectable, Logger } from "@nestjs/common";

type GetAllEmployeesUseCaseResponse = Either<
  InternalError,
  {
    employee: Employee[];
  }
>;

@Injectable()
export class GetAllEmployeesUseCase {
  private readonly logger = new Logger(GetAllEmployeesUseCase.name);

  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(): Promise<GetAllEmployeesUseCaseResponse> {
    try {
      return right({
        employee: await this.employeeRepository.findAll()
      });
    } catch (_error) {
      this.logger.error("Failed to fetch employees", _error);
      return left(new InternalError("Failed to fetch employees"));
    }
  }
}

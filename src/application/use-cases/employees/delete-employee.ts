import { left, right, type Either } from "@/core/either";
import { InternalError } from "@/core/errors";
import { EmployeeRepository } from "@/domain/repositories";
import { Injectable, Logger } from "@nestjs/common";

type DeleteEmployeeUseCaseResponse = Either<InternalError, void>;

@Injectable()
export class DeleteEmployeeUseCase {
  private readonly logger = new Logger(DeleteEmployeeUseCase.name);

  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(employeeId: string): Promise<DeleteEmployeeUseCaseResponse> {
    try {
      return right(await this.employeeRepository.delete(employeeId));
    } catch (error) {
      this.logger.error("Failed to delete employee", error);
      return left(new InternalError("Failed to delete employee"));
    }
  }
}

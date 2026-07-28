import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import type { EmployeeDocumentType } from "@/domain/entities";
import { EmployeeDocumentTypeRepository } from "@/domain/repositories/employee-document-type-repository";
import { EmployeeRepository } from "@/domain/repositories/employee-repository";
import { Injectable, Logger } from "@nestjs/common";

type GetLinkedDocumentTypesUseCaseResponse = Either<
  ValidationError | NotFoundError | InternalError,
  { links: EmployeeDocumentType[] }
>;

@Injectable()
export class GetLinkedDocumentTypesUseCase {
  private readonly logger = new Logger(GetLinkedDocumentTypesUseCase.name);

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly linkRepository: EmployeeDocumentTypeRepository
  ) {}

  async execute(
    employeeId: string
  ): Promise<GetLinkedDocumentTypesUseCaseResponse> {
    try {
      if (!employeeId) {
        return left(new ValidationError("Employee ID is required"));
      }

      const employee = await this.employeeRepository.findById(employeeId);

      if (!employee) {
        return left(new NotFoundError("Employee", employeeId));
      }

      const links = await this.linkRepository.findActiveByEmployee(employeeId);

      return right({ links });
    } catch (error) {
      this.logger.error("Failed to fetch linked document types", error);
      return left(new InternalError("Failed to fetch linked document types"));
    }
  }
}

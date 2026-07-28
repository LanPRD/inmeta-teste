import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import type { DocumentSubmission } from "@/domain/entities";
import { DocumentSubmissionRepository } from "@/domain/repositories/document-submission-repository";
import { EmployeeRepository } from "@/domain/repositories/employee-repository";
import { Injectable, Logger } from "@nestjs/common";

type GetSubmissionHistoryUseCaseResponse = Either<
  ValidationError | NotFoundError | InternalError,
  { submissions: DocumentSubmission[] }
>;

@Injectable()
export class GetSubmissionHistoryUseCase {
  private readonly logger = new Logger(GetSubmissionHistoryUseCase.name);

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly submissionRepository: DocumentSubmissionRepository
  ) {}

  async execute(
    employeeId: string,
    documentTypeId: string,
    includeDeleted?: boolean
  ): Promise<GetSubmissionHistoryUseCaseResponse> {
    try {
      if (!employeeId || !documentTypeId) {
        return left(
          new ValidationError("Employee ID and document type ID are required")
        );
      }

      const employee =
        await this.employeeRepository.findByIdIncludingDeleted(employeeId);

      if (!employee) {
        return left(new NotFoundError("Employee", employeeId));
      }

      const submissions = await this.submissionRepository.findHistory(
        employeeId,
        documentTypeId,
        includeDeleted
      );

      return right({ submissions });
    } catch (error) {
      this.logger.error("Failed to fetch submission history", error);
      return left(new InternalError("Failed to fetch submission history"));
    }
  }
}

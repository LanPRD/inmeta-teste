import {
  CreateDocumentSubmissionSchema,
  type CreateDocumentSubmissionDto
} from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import { DocumentSubmission } from "@/domain/entities";
import { SubmissionStatus } from "@/domain/enums";
import { DocumentSubmissionRepository } from "@/domain/repositories/document-submission-repository";
import { EmployeeRepository } from "@/domain/repositories/employee-repository";
import { Injectable, Logger } from "@nestjs/common";

type SubmitDocumentUseCaseResponse = Either<
  ValidationError | NotFoundError | InternalError,
  { submission: DocumentSubmission }
>;

@Injectable()
export class SubmitDocumentUseCase {
  private readonly logger = new Logger(SubmitDocumentUseCase.name);

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly submissionRepository: DocumentSubmissionRepository
  ) {}

  async execute(
    employeeId: string,
    input: CreateDocumentSubmissionDto
  ): Promise<SubmitDocumentUseCaseResponse> {
    try {
      const parsed = CreateDocumentSubmissionSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid submission data"));
      }

      const employee = await this.employeeRepository.findById(employeeId);

      if (!employee) {
        return left(new NotFoundError("Employee", employeeId));
      }

      const { documentTypeId } = parsed.data;

      const activeVersion = await this.submissionRepository.findActiveVersion(
        employeeId,
        documentTypeId
      );

      const nextVersion = activeVersion ? activeVersion.version + 1 : 1;

      const next = DocumentSubmission.create({
        employeeId,
        documentTypeId,
        version: nextVersion,
        status: SubmissionStatus.ACTIVE
      });

      const previous =
        activeVersion ?
          DocumentSubmission.create(
            {
              employeeId: activeVersion.employeeId,
              documentTypeId: activeVersion.documentTypeId,
              version: activeVersion.version,
              status: SubmissionStatus.SUPERSEDED,
              submittedAt: activeVersion.submittedAt
            },
            activeVersion.id
          )
        : null;

      const created = await this.submissionRepository.submit(previous, next);

      return right({ submission: created });
    } catch (error) {
      this.logger.error("Failed to submit document", error);
      return left(new InternalError("Failed to submit document"));
    }
  }
}

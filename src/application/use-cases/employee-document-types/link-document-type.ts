import { left, right, type Either } from "@/core/either";
import { ConflictError, InternalError, NotFoundError } from "@/core/errors";
import { EmployeeDocumentType } from "@/domain/entities";
import { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import { EmployeeDocumentTypeRepository } from "@/domain/repositories/employee-document-type-repository";
import { EmployeeRepository } from "@/domain/repositories/employee-repository";
import { Injectable, Logger } from "@nestjs/common";

type LinkDocumentTypeUseCaseResponse = Either<
  NotFoundError | ConflictError | InternalError,
  { link: EmployeeDocumentType }
>;

@Injectable()
export class LinkDocumentTypeUseCase {
  private readonly logger = new Logger(LinkDocumentTypeUseCase.name);

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly documentTypeRepository: DocumentTypeRepository,
    private readonly linkRepository: EmployeeDocumentTypeRepository
  ) {}

  async execute(
    employeeId: string,
    documentTypeId: string
  ): Promise<LinkDocumentTypeUseCaseResponse> {
    try {
      const employee = await this.employeeRepository.findById(employeeId);

      if (!employee) {
        return left(new NotFoundError("Employee", employeeId));
      }

      const documentType =
        await this.documentTypeRepository.findById(documentTypeId);

      if (!documentType) {
        return left(new NotFoundError("DocumentType", documentTypeId));
      }

      const existingLink =
        await this.linkRepository.findByEmployeeAndDocumentType(
          employeeId,
          documentTypeId
        );

      if (existingLink && !existingLink.unlinkedAt) {
        return left(
          new ConflictError(
            "This document type is already linked to the employee"
          )
        );
      }

      const link = EmployeeDocumentType.create({
        employeeId,
        documentTypeId
      });

      const created = await this.linkRepository.create(link);

      return right({ link: created });
    } catch (error) {
      this.logger.error("Failed to link document type", error);
      return left(new InternalError("Failed to link document type"));
    }
  }
}

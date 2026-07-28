import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError } from "@/core/errors";
import { EmployeeDocumentType } from "@/domain/entities";
import { EmployeeDocumentTypeRepository } from "@/domain/repositories/employee-document-type-repository";
import { Injectable, Logger } from "@nestjs/common";

type UnlinkDocumentTypeUseCaseResponse = Either<
  NotFoundError | InternalError,
  { link: EmployeeDocumentType }
>;

@Injectable()
export class UnlinkDocumentTypeUseCase {
  private readonly logger = new Logger(UnlinkDocumentTypeUseCase.name);

  constructor(
    private readonly linkRepository: EmployeeDocumentTypeRepository
  ) {}

  async execute(
    employeeId: string,
    documentTypeId: string
  ): Promise<UnlinkDocumentTypeUseCaseResponse> {
    try {
      const existingLink =
        await this.linkRepository.findByEmployeeAndDocumentType(
          employeeId,
          documentTypeId
        );

      if (!existingLink || existingLink.unlinkedAt) {
        return left(new NotFoundError("Link"));
      }

      const unlinked = EmployeeDocumentType.create(
        {
          employeeId: existingLink.employeeId,
          documentTypeId: existingLink.documentTypeId,
          linkedAt: existingLink.linkedAt,
          unlinkedAt: new Date()
        },
        existingLink.id
      );

      await this.linkRepository.update(unlinked);

      return right({ link: unlinked });
    } catch (error) {
      this.logger.error("Failed to unlink document type", error);
      return left(new InternalError("Failed to unlink document type"));
    }
  }
}

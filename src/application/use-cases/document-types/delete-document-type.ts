import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import type { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import { Injectable, Logger } from "@nestjs/common";

type DeleteDocumentTypeUseCaseResponse = Either<
  ValidationError | NotFoundError | InternalError,
  void
>;

@Injectable()
export class DeleteDocumentTypeUseCase {
  private readonly logger = new Logger(DeleteDocumentTypeUseCase.name);

  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository
  ) {}

  async execute(
    documentTypeId: string
  ): Promise<DeleteDocumentTypeUseCaseResponse> {
    try {
      if (!documentTypeId) {
        return left(new ValidationError("Document type ID is required"));
      }

      const existing =
        await this.documentTypeRepository.findById(documentTypeId);

      if (!existing) {
        return left(new NotFoundError("DocumentType", documentTypeId));
      }

      await this.documentTypeRepository.delete(documentTypeId);

      return right(undefined);
    } catch (error) {
      this.logger.error("Failed to delete document type", error);
      return left(new InternalError("Failed to delete document type"));
    }
  }
}

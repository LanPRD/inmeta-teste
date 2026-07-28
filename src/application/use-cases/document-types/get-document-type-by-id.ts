import { left, right, type Either } from "@/core/either";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import type { DocumentType } from "@/domain/entities";
import { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import { Injectable, Logger } from "@nestjs/common";

type GetDocumentTypeByIdUseCaseResponse = Either<
  ValidationError | NotFoundError | InternalError,
  { documentType: DocumentType }
>;

@Injectable()
export class GetDocumentTypeByIdUseCase {
  private readonly logger = new Logger(GetDocumentTypeByIdUseCase.name);

  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository
  ) {}

  async execute(
    documentTypeId: string
  ): Promise<GetDocumentTypeByIdUseCaseResponse> {
    try {
      if (!documentTypeId) {
        return left(new ValidationError("Document type ID is required"));
      }

      const documentType =
        await this.documentTypeRepository.findById(documentTypeId);

      if (!documentType) {
        return left(new NotFoundError("DocumentType", documentTypeId));
      }

      return right({ documentType });
    } catch (error) {
      this.logger.error("Failed to get document type by ID", error);
      return left(new InternalError("Failed to get document type by ID"));
    }
  }
}

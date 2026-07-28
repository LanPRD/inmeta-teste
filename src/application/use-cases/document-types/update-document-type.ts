import {
  UpdateDocumentTypeSchema,
  type UpdateDocumentTypeDto
} from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import {
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError
} from "@/core/errors";
import { DocumentType } from "@/domain/entities";
import { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import { Injectable, Logger } from "@nestjs/common";

type UpdateDocumentTypeUseCaseResponse = Either<
  ValidationError | NotFoundError | ConflictError | InternalError,
  { documentType: DocumentType }
>;

@Injectable()
export class UpdateDocumentTypeUseCase {
  private readonly logger = new Logger(UpdateDocumentTypeUseCase.name);

  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository
  ) {}

  async execute(
    documentTypeId: string,
    input: UpdateDocumentTypeDto
  ): Promise<UpdateDocumentTypeUseCaseResponse> {
    try {
      const parsed = UpdateDocumentTypeSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid update data"));
      }

      const existing =
        await this.documentTypeRepository.findById(documentTypeId);

      if (!existing) {
        return left(new NotFoundError("DocumentType", documentTypeId));
      }

      if (parsed.data.name && parsed.data.name !== existing.name) {
        const nameTaken = await this.documentTypeRepository.findByName(
          parsed.data.name
        );

        if (nameTaken && nameTaken.id.toString() !== documentTypeId) {
          return left(
            new ConflictError("Document type with this name already exists")
          );
        }
      }

      const updated = DocumentType.create(
        {
          name: parsed.data.name ?? existing.name,
          description:
            parsed.data.description !== undefined ?
              parsed.data.description
            : existing.description,
          createdAt: existing.createdAt
        },
        existing.id
      );

      await this.documentTypeRepository.update(updated);

      return right({ documentType: updated });
    } catch (error) {
      this.logger.error("Failed to update document type", error);
      return left(new InternalError("Failed to update document type"));
    }
  }
}

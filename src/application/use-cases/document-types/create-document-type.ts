import {
  CreateDocumentTypeSchema,
  type CreateDocumentTypeDto
} from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { ConflictError, InternalError, ValidationError } from "@/core/errors";
import { DocumentType } from "@/domain/entities";
import { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import { Injectable, Logger } from "@nestjs/common";

type CreateDocumentTypeUseCaseResponse = Either<
  ValidationError | ConflictError | InternalError,
  { documentType: DocumentType }
>;

@Injectable()
export class CreateDocumentTypeUseCase {
  private readonly logger = new Logger(CreateDocumentTypeUseCase.name);

  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository
  ) {}

  async execute(
    input: CreateDocumentTypeDto
  ): Promise<CreateDocumentTypeUseCaseResponse> {
    try {
      const parsed = CreateDocumentTypeSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid document type data"));
      }

      const { name, description } = parsed.data;

      const alreadyExists = await this.documentTypeRepository.findByName(name);

      if (alreadyExists) {
        return left(
          new ConflictError("Document type with this name already exists")
        );
      }

      const documentType = DocumentType.create({ name, description });
      const created = await this.documentTypeRepository.create(documentType);

      return right({ documentType: created });
    } catch (error) {
      this.logger.error("Error creating document type", error);
      return left(new InternalError("Error creating document type"));
    }
  }
}

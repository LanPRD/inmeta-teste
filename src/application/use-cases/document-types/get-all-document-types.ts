import {
  GetAllDocumentTypesSchema,
  type GetAllDocumentTypesDto
} from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { InternalError, ValidationError } from "@/core/errors";
import type { DocumentType } from "@/domain/entities";
import type { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import { Injectable, Logger } from "@nestjs/common";

type GetAllDocumentTypesUseCaseResponse = Either<
  ValidationError | InternalError,
  {
    documentTypes: DocumentType[];
    meta: { page: number; limit: number; total: number };
  }
>;

@Injectable()
export class GetAllDocumentTypesUseCase {
  private readonly logger = new Logger(GetAllDocumentTypesUseCase.name);

  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository
  ) {}

  async execute(
    input: GetAllDocumentTypesDto
  ): Promise<GetAllDocumentTypesUseCaseResponse> {
    try {
      const parsed = GetAllDocumentTypesSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid query parameters"));
      }

      const { page, limit, name, includeDeleted } = parsed.data;

      const { data, total } = await this.documentTypeRepository.findAll({
        page,
        limit,
        name,
        includeDeleted
      });

      return right({
        documentTypes: data,
        meta: { page, limit, total }
      });
    } catch (error) {
      this.logger.error("Failed to fetch document types", error);
      return left(new InternalError("Failed to fetch document types"));
    }
  }
}

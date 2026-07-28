import { UniqueEntityId } from "@/core/entities";
import { DocumentType } from "@/domain/entities";
import {
  DocumentType as PrismaDocumentType,
  type Prisma
} from "@prisma/client";

export class PrismaDocumentTypeMapper {
  static toDomain(raw: PrismaDocumentType): DocumentType {
    return DocumentType.create(
      {
        name: raw.name,
        description: raw.description ?? undefined,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt
      },
      new UniqueEntityId(raw.id)
    );
  }

  static toPrisma(
    documentType: DocumentType
  ): Prisma.DocumentTypeUncheckedCreateInput {
    return {
      id: documentType.id.toString(),
      name: documentType.name,
      description: documentType.description ?? null,
      createdAt: documentType.createdAt,
      updatedAt: documentType.updatedAt,
      deletedAt: documentType.deletedAt
    };
  }
}

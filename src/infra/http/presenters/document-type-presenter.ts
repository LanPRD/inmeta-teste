import type { DocumentType } from "@/domain/entities";

export class DocumentTypePresenter {
  static toHTTP(documentType: DocumentType) {
    return {
      id: documentType.id.toString(),
      name: documentType.name,
      description: documentType.description,
      createdAt: documentType.createdAt,
      updatedAt: documentType.updatedAt,
      deletedAt: documentType.deletedAt
    };
  }
}

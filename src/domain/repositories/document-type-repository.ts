import type { DocumentType } from "../entities";
import type { FindAllParams } from "./employee-repository";

export abstract class DocumentTypeRepository {
  abstract findAll(
    params: FindAllParams
  ): Promise<{ data: DocumentType[]; total: number }>;
  abstract findById(id: string): Promise<DocumentType | null>;
  abstract findByName(name: string): Promise<DocumentType | null>;
  abstract create(documentType: DocumentType): Promise<DocumentType>;
  abstract update(documentType: DocumentType): Promise<void>;
  abstract delete(id: string): Promise<void>;
}

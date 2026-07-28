import type { DocumentType } from "@/domain/entities";
import type { FindAllParams } from "@/domain/repositories";
import { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";

export class InMemoryDocumentTypeRepository extends DocumentTypeRepository {
  private documentTypes: DocumentType[] = [];
  private deletedIds = new Set<string>();
  forceError = false;

  async findAll(
    params: FindAllParams
  ): Promise<{ data: DocumentType[]; total: number }> {
    if (this.forceError) throw new Error("Forced error");

    let filtered = this.documentTypes;

    if (!params.includeDeleted) {
      filtered = filtered.filter(d => !this.deletedIds.has(d.id.toString()));
    }

    if (params.name) {
      const search = params.name.toLowerCase();
      filtered = filtered.filter(d => d.name.toLowerCase().includes(search));
    }

    const total = filtered.length;
    const offset = (params.page - 1) * params.limit;
    const data = filtered.slice(offset, offset + params.limit);

    return { data, total };
  }

  async findById(id: string): Promise<DocumentType | null> {
    if (this.forceError) throw new Error("Forced error");
    return (
      this.documentTypes.find(
        d => d.id.toString() === id && !this.deletedIds.has(d.id.toString())
      ) ?? null
    );
  }

  async findByName(name: string): Promise<DocumentType | null> {
    if (this.forceError) throw new Error("Forced error");
    return (
      this.documentTypes.find(
        d =>
          d.name.toLowerCase() === name.toLowerCase() &&
          !this.deletedIds.has(d.id.toString())
      ) ?? null
    );
  }

  async create(documentType: DocumentType): Promise<DocumentType> {
    this.documentTypes.push(documentType);
    return documentType;
  }

  async update(documentType: DocumentType): Promise<void> {
    const index = this.documentTypes.findIndex(
      d => d.id.toString() === documentType.id.toString()
    );
    if (index !== -1) {
      this.documentTypes[index] = documentType;
    }
  }

  async delete(id: string): Promise<void> {
    this.deletedIds.add(id);
  }
}

import { ConflictError } from "@/core/errors";
import type { EmployeeDocumentType } from "@/domain/entities";
import { EmployeeDocumentTypeRepository } from "@/domain/repositories/employee-document-type-repository";

export class InMemoryEmployeeDocumentTypeRepository extends EmployeeDocumentTypeRepository {
  private links: EmployeeDocumentType[] = [];
  forceError = false;

  async findActiveByEmployee(
    employeeId: string
  ): Promise<EmployeeDocumentType[]> {
    if (this.forceError) throw new Error("Forced error");
    return this.links.filter(l => l.employeeId === employeeId && !l.unlinkedAt);
  }

  async findByEmployeeAndDocumentType(
    employeeId: string,
    documentTypeId: string
  ): Promise<EmployeeDocumentType | null> {
    if (this.forceError) throw new Error("Forced error");
    return (
      this.links.find(
        l => l.employeeId === employeeId && l.documentTypeId === documentTypeId
      ) ?? null
    );
  }

  async create(link: EmployeeDocumentType): Promise<EmployeeDocumentType> {
    this.links.push(link);
    return link;
  }

  async createActiveLink(
    link: EmployeeDocumentType
  ): Promise<EmployeeDocumentType> {
    if (this.forceError) throw new Error("Forced error");

    const existing = this.links.find(
      l =>
        l.employeeId === link.employeeId &&
        l.documentTypeId === link.documentTypeId &&
        !l.unlinkedAt
    );

    if (existing) {
      throw new ConflictError(
        "This document type is already linked to the employee"
      );
    }

    this.links.push(link);
    return link;
  }

  async update(link: EmployeeDocumentType): Promise<void> {
    const index = this.links.findIndex(
      l => l.id.toString() === link.id.toString()
    );
    if (index !== -1) {
      this.links[index] = link;
    }
  }
}

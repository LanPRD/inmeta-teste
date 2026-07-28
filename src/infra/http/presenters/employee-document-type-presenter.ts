import type { EmployeeDocumentType } from "@/domain/entities";

export class EmployeeDocumentTypePresenter {
  static toHTTP(link: EmployeeDocumentType) {
    return {
      id: link.id.toString(),
      employeeId: link.employeeId,
      documentTypeId: link.documentTypeId,
      linkedAt: link.linkedAt,
      unlinkedAt: link.unlinkedAt
    };
  }
}

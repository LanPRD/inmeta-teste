import type { EmployeeDocumentType } from "../entities";

export abstract class EmployeeDocumentTypeRepository {
  abstract findActiveByEmployee(
    employeeId: string
  ): Promise<EmployeeDocumentType[]>;
  abstract findByEmployeeAndDocumentType(
    employeeId: string,
    documentTypeId: string
  ): Promise<EmployeeDocumentType | null>;
  abstract create(link: EmployeeDocumentType): Promise<EmployeeDocumentType>;
  abstract update(link: EmployeeDocumentType): Promise<void>;
}

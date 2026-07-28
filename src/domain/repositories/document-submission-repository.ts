import type { DocumentSubmission } from "../entities";

export abstract class DocumentSubmissionRepository {
  abstract findActiveByEmployee(
    employeeId: string,
    documentTypeId?: string
  ): Promise<DocumentSubmission[]>;
  abstract findActiveVersion(
    employeeId: string,
    documentTypeId: string
  ): Promise<DocumentSubmission | null>;
  abstract findHistory(
    employeeId: string,
    documentTypeId: string
  ): Promise<DocumentSubmission[]>;
  abstract create(submission: DocumentSubmission): Promise<DocumentSubmission>;
  abstract update(submission: DocumentSubmission): Promise<void>;
  abstract submit(
    previous: DocumentSubmission | null,
    next: DocumentSubmission
  ): Promise<DocumentSubmission>;
}

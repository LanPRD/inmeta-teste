import type { DocumentSubmission } from "../entities";

export interface FindPendingResult {
  employeeId: string;
  employeeName: string;
  documentTypeId: string;
  documentTypeName: string;
  linkedAt: Date;
}

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
  abstract findPending(
    page: number,
    limit: number
  ): Promise<{ data: FindPendingResult[]; total: number }>;
  abstract submit(
    previous: DocumentSubmission | null,
    next: DocumentSubmission
  ): Promise<DocumentSubmission>;
}

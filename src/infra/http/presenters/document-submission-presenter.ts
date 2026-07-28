import type { DocumentSubmission } from "@/domain/entities";

export class DocumentSubmissionPresenter {
  static toHTTP(submission: DocumentSubmission) {
    return {
      id: submission.id.toString(),
      employeeId: submission.employeeId,
      documentTypeId: submission.documentTypeId,
      version: submission.version,
      status: submission.status,
      submittedAt: submission.submittedAt,
      deletedAt: submission.deletedAt
    };
  }
}

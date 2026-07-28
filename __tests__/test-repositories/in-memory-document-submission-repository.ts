import type { DocumentSubmission } from "@/domain/entities";
import {
  DocumentSubmissionRepository,
  type GetStatsResult
} from "@/domain/repositories/document-submission-repository";

export class InMemoryDocumentSubmissionRepository extends DocumentSubmissionRepository {
  private submissions: DocumentSubmission[] = [];
  forceError = false;

  async findActiveByEmployee(
    employeeId: string,
    documentTypeId?: string
  ): Promise<DocumentSubmission[]> {
    if (this.forceError) throw new Error("Forced error");

    return this.submissions.filter(
      s =>
        s.employeeId === employeeId &&
        s.status === "ACTIVE" &&
        !s.deletedAt &&
        (!documentTypeId || s.documentTypeId === documentTypeId)
    );
  }

  async findActiveVersion(
    employeeId: string,
    documentTypeId: string
  ): Promise<DocumentSubmission | null> {
    if (this.forceError) throw new Error("Forced error");

    return (
      this.submissions.find(
        s =>
          s.employeeId === employeeId &&
          s.documentTypeId === documentTypeId &&
          s.status === "ACTIVE" &&
          !s.deletedAt
      ) ?? null
    );
  }

  async findHistory(
    employeeId: string,
    documentTypeId: string
  ): Promise<DocumentSubmission[]> {
    if (this.forceError) throw new Error("Forced error");

    return this.submissions
      .filter(
        s =>
          s.employeeId === employeeId &&
          s.documentTypeId === documentTypeId &&
          !s.deletedAt
      )
      .sort((a, b) => b.version - a.version);
  }

  async create(submission: DocumentSubmission): Promise<DocumentSubmission> {
    this.submissions.push(submission);
    return submission;
  }

  async update(submission: DocumentSubmission): Promise<void> {
    const index = this.submissions.findIndex(
      s => s.id.toString() === submission.id.toString()
    );
    if (index !== -1) {
      this.submissions[index] = submission;
    }
  }

  async findPending(
    page: number,
    limit: number
  ): Promise<{
    data: Array<{
      employeeId: string;
      employeeName: string;
      documentTypeId: string;
      documentTypeName: string;
      linkedAt: Date;
    }>;
    total: number;
  }> {
    if (this.forceError) throw new Error("Forced error");

    const offset = (page - 1) * limit;

    return {
      data: this.pendingItems.slice(offset, offset + limit),
      total: this.pendingItems.length
    };
  }

  // Helpers for tests
  pendingItems: Array<{
    employeeId: string;
    employeeName: string;
    documentTypeId: string;
    documentTypeName: string;
    linkedAt: Date;
  }> = [];
  statsData: GetStatsResult = {
    totalRequired: 0,
    totalFulfilled: 0,
    mostPending: [],
    recentSubmissions: []
  };

  async getStats(): Promise<GetStatsResult> {
    if (this.forceError) throw new Error("Forced error");
    return this.statsData;
  }

  async submit(
    previous: DocumentSubmission | null,
    next: DocumentSubmission
  ): Promise<DocumentSubmission> {
    if (previous) {
      const index = this.submissions.findIndex(
        s => s.id.toString() === previous.id.toString()
      );
      if (index !== -1) {
        this.submissions[index] = previous;
      }
    }

    this.submissions.push(next);
    return next;
  }
}

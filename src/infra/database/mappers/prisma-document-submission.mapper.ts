import { UniqueEntityId } from "@/core/entities";
import { DocumentSubmission } from "@/domain/entities";
import { SubmissionStatus } from "@/domain/enums";
import {
  DocumentSubmission as PrismaDocumentSubmission,
  type Prisma
} from "@prisma/client";

export class PrismaDocumentSubmissionMapper {
  static toDomain(raw: PrismaDocumentSubmission): DocumentSubmission {
    return DocumentSubmission.create(
      {
        employeeId: raw.employeeId,
        documentTypeId: raw.documentTypeId,
        version: raw.version,
        status: raw.status as SubmissionStatus,
        submittedAt: raw.submittedAt,
        deletedAt: raw.deletedAt
      },
      new UniqueEntityId(raw.id)
    );
  }

  static toPrisma(
    submission: DocumentSubmission
  ): Prisma.DocumentSubmissionUncheckedCreateInput {
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

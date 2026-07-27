import { Entity } from "@/core/entities/entity";
import type { UniqueEntityId } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";
import type { SubmissionStatus } from "../enums";

interface DocumentSubmissionProps {
  employeeId: string;
  documentTypeId: string;
  version: number;
  status: SubmissionStatus;
  submittedAt: Date;
  deletedAt: Date | null;
}

export class DocumentSubmission extends Entity<DocumentSubmissionProps> {
  get employeeId(): string {
    return this.props.employeeId;
  }

  get documentTypeId(): string {
    return this.props.documentTypeId;
  }

  get version(): number {
    return this.props.version;
  }

  get status(): SubmissionStatus {
    return this.props.status;
  }

  get submittedAt(): Date {
    return this.props.submittedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<DocumentSubmissionProps, "submittedAt" | "deletedAt">,
    id?: UniqueEntityId
  ): DocumentSubmission {
    return new DocumentSubmission(
      {
        submittedAt: new Date(),
        deletedAt: null,
        ...props
      },
      id
    );
  }
}

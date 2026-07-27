import { Entity, type UniqueEntityId } from "@/core/entities";
import type { Optional } from "@/core/types/optional";
import type { DocumentSubmission } from "./document-submission";
import type { EmployeeDocumentType } from "./employee-document-type";

export interface DocumentTypeProps {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  employeeDocumentTypes?: EmployeeDocumentType[];
  documentSubmissions?: DocumentSubmission[];
}

export class DocumentType extends Entity<DocumentTypeProps> {
  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  get employeeDocumentTypes(): EmployeeDocumentType[] | undefined {
    return this.props.employeeDocumentTypes;
  }

  get documentSubmissions(): DocumentSubmission[] | undefined {
    return this.props.documentSubmissions;
  }

  static create(
    props: Optional<DocumentTypeProps, "createdAt" | "updatedAt" | "deletedAt">,
    id?: UniqueEntityId
  ): DocumentType {
    return new DocumentType(
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...props
      },
      id
    );
  }
}

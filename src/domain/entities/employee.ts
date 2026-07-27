import { Entity, UniqueEntityId } from "@/core/entities";
import type { Optional } from "@/core/types/optional";
import type { DocumentSubmission } from "./document-submission";
import type { EmployeeDocumentType } from "./employee-document-type";

export interface EmployeeProps {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  employeeDocumentTypes?: EmployeeDocumentType[];
  documentSubmissions?: DocumentSubmission[];
}

export class Employee extends Entity<EmployeeProps> {
  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
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
    props: Optional<EmployeeProps, "createdAt" | "updatedAt" | "deletedAt">,
    id?: UniqueEntityId
  ): Employee {
    return new Employee(
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

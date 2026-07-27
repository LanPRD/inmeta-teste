import type { UniqueEntityId } from "@/core/entities";
import { Entity } from "@/core/entities/entity";
import type { Optional } from "@/core/types/optional";

interface EmployeeDocumentTypeProps {
  employeeId: string;
  documentTypeId: string;
  linkedAt: Date;
  unlinkedAt: Date | null;
}

export class EmployeeDocumentType extends Entity<EmployeeDocumentTypeProps> {
  get employeeId(): string {
    return this.props.employeeId;
  }

  get documentTypeId(): string {
    return this.props.documentTypeId;
  }

  get linkedAt(): Date {
    return this.props.linkedAt;
  }

  get unlinkedAt(): Date | null {
    return this.props.unlinkedAt;
  }

  static create(
    props: Optional<EmployeeDocumentTypeProps, "linkedAt" | "unlinkedAt">,
    id?: UniqueEntityId
  ): EmployeeDocumentType {
    return new EmployeeDocumentType(
      {
        linkedAt: new Date(),
        unlinkedAt: null,
        ...props
      },
      id
    );
  }
}

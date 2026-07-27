import { Entity, type UniqueEntityId } from "@/core/entities";

export interface DocumentTypeProps {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
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

  static create(props: DocumentTypeProps, id?: UniqueEntityId): DocumentType {
    return new DocumentType(props, id);
  }
}

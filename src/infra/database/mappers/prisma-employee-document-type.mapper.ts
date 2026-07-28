import { UniqueEntityId } from "@/core/entities";
import { EmployeeDocumentType } from "@/domain/entities";
import {
  EmployeeDocumentType as PrismaEmployeeDocumentType,
  type Prisma
} from "@prisma/client";

export class PrismaEmployeeDocumentTypeMapper {
  static toDomain(raw: PrismaEmployeeDocumentType): EmployeeDocumentType {
    return EmployeeDocumentType.create(
      {
        employeeId: raw.employeeId,
        documentTypeId: raw.documentTypeId,
        linkedAt: raw.linkedAt,
        unlinkedAt: raw.unlinkedAt
      },
      new UniqueEntityId(raw.id)
    );
  }

  static toPrisma(
    link: EmployeeDocumentType
  ): Prisma.EmployeeDocumentTypeUncheckedCreateInput {
    return {
      id: link.id.toString(),
      employeeId: link.employeeId,
      documentTypeId: link.documentTypeId,
      linkedAt: link.linkedAt,
      unlinkedAt: link.unlinkedAt
    };
  }
}

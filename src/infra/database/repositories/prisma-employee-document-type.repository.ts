import { ConflictError } from "@/core/errors";
import { EmployeeDocumentType } from "@/domain/entities";
import { EmployeeDocumentTypeRepository } from "@/domain/repositories/employee-document-type-repository";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaEmployeeDocumentTypeMapper } from "../mappers/prisma-employee-document-type.mapper";
import { PrismaService } from "../prisma/prisma.service";

const SERIALIZATION_FAILURE_ERROR_CODE = "P2034";

@Injectable()
export class PrismaEmployeeDocumentTypeRepository implements EmployeeDocumentTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByEmployee(
    employeeId: string
  ): Promise<EmployeeDocumentType[]> {
    const links = await this.prisma.employeeDocumentType.findMany({
      where: { employeeId, unlinkedAt: null }
    });

    return links.map(PrismaEmployeeDocumentTypeMapper.toDomain);
  }

  async findByEmployeeAndDocumentType(
    employeeId: string,
    documentTypeId: string
  ): Promise<EmployeeDocumentType | null> {
    const link = await this.prisma.employeeDocumentType.findFirst({
      where: { employeeId, documentTypeId },
      orderBy: { linkedAt: "desc" }
    });

    if (!link) return null;

    return PrismaEmployeeDocumentTypeMapper.toDomain(link);
  }

  async create(link: EmployeeDocumentType): Promise<EmployeeDocumentType> {
    const raw = await this.prisma.employeeDocumentType.create({
      data: PrismaEmployeeDocumentTypeMapper.toPrisma(link)
    });

    return PrismaEmployeeDocumentTypeMapper.toDomain(raw);
  }

  async createActiveLink(
    link: EmployeeDocumentType
  ): Promise<EmployeeDocumentType> {
    try {
      const raw = await this.prisma.$transaction(
        async tx => {
          const existing = await tx.employeeDocumentType.findFirst({
            where: {
              employeeId: link.employeeId,
              documentTypeId: link.documentTypeId,
              unlinkedAt: null
            }
          });

          if (existing) {
            throw new ConflictError(
              "This document type is already linked to the employee"
            );
          }

          return tx.employeeDocumentType.create({
            data: PrismaEmployeeDocumentTypeMapper.toPrisma(link)
          });
        },
        { isolationLevel: "Serializable" }
      );

      return PrismaEmployeeDocumentTypeMapper.toDomain(raw);
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === SERIALIZATION_FAILURE_ERROR_CODE
      ) {
        throw new ConflictError(
          "This document type is already linked to the employee"
        );
      }

      throw error;
    }
  }

  async update(link: EmployeeDocumentType): Promise<void> {
    await this.prisma.employeeDocumentType.update({
      where: { id: link.id.toString() },
      data: { unlinkedAt: link.unlinkedAt }
    });
  }
}

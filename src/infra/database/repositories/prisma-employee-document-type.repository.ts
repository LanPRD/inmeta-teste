import { EmployeeDocumentType } from "@/domain/entities";
import { EmployeeDocumentTypeRepository } from "@/domain/repositories/employee-document-type-repository";
import { Injectable } from "@nestjs/common";
import { PrismaEmployeeDocumentTypeMapper } from "../mappers/prisma-employee-document-type.mapper";
import { PrismaService } from "../prisma/prisma.service";

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
      where: { employeeId, documentTypeId }
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

  async update(link: EmployeeDocumentType): Promise<void> {
    await this.prisma.employeeDocumentType.update({
      where: { id: link.id.toString() },
      data: { unlinkedAt: link.unlinkedAt }
    });
  }
}

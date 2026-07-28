import { ConflictError } from "@/core/errors";
import { DocumentType } from "@/domain/entities";
import { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import type { FindAllParams } from "@/domain/repositories/employee-repository";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaDocumentTypeMapper } from "../mappers";
import { PrismaService } from "../prisma/prisma.service";

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

@Injectable()
export class PrismaDocumentTypeRepository implements DocumentTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    params: FindAllParams
  ): Promise<{ data: DocumentType[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (!params.includeDeleted) {
      where.deletedAt = null;
    }

    if (params.name) {
      where.name = { contains: params.name, mode: "insensitive" };
    }

    const [documentTypes, total] = await Promise.all([
      this.prisma.documentType.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit
      }),
      this.prisma.documentType.count({ where })
    ]);

    return {
      data: documentTypes.map(PrismaDocumentTypeMapper.toDomain),
      total
    };
  }

  async findById(id: string): Promise<DocumentType | null> {
    const raw = await this.prisma.documentType.findFirst({
      where: { id, deletedAt: null }
    });

    if (!raw) return null;

    return PrismaDocumentTypeMapper.toDomain(raw);
  }

  async findByName(name: string): Promise<DocumentType | null> {
    const raw = await this.prisma.documentType.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        deletedAt: null
      }
    });

    if (!raw) return null;

    return PrismaDocumentTypeMapper.toDomain(raw);
  }

  async create(documentType: DocumentType): Promise<DocumentType> {
    try {
      const raw = await this.prisma.documentType.create({
        data: PrismaDocumentTypeMapper.toPrisma(documentType)
      });

      return PrismaDocumentTypeMapper.toDomain(raw);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        throw new ConflictError("Document type with this name already exists");
      }

      throw error;
    }
  }

  async update(documentType: DocumentType): Promise<void> {
    try {
      await this.prisma.documentType.update({
        where: { id: documentType.id.toString() },
        data: {
          name: documentType.name,
          description: documentType.description ?? null
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        throw new ConflictError("Document type with this name already exists");
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.documentType.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

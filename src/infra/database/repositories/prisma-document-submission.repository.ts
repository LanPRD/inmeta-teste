import { DocumentSubmission } from "@/domain/entities";
import { DocumentSubmissionRepository } from "@/domain/repositories/document-submission-repository";
import { Injectable } from "@nestjs/common";
import { PrismaDocumentSubmissionMapper } from "../mappers/prisma-document-submission.mapper";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PrismaDocumentSubmissionRepository implements DocumentSubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByEmployee(
    employeeId: string,
    documentTypeId?: string
  ): Promise<DocumentSubmission[]> {
    const where: Record<string, unknown> = {
      employeeId,
      status: "ACTIVE",
      deletedAt: null
    };

    if (documentTypeId) {
      where.documentTypeId = documentTypeId;
    }

    const submissions = await this.prisma.documentSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" }
    });

    return submissions.map(PrismaDocumentSubmissionMapper.toDomain);
  }

  async findActiveVersion(
    employeeId: string,
    documentTypeId: string
  ): Promise<DocumentSubmission | null> {
    const submission = await this.prisma.documentSubmission.findFirst({
      where: {
        employeeId,
        documentTypeId,
        status: "ACTIVE",
        deletedAt: null
      }
    });

    if (!submission) return null;

    return PrismaDocumentSubmissionMapper.toDomain(submission);
  }

  async findHistory(
    employeeId: string,
    documentTypeId: string
  ): Promise<DocumentSubmission[]> {
    const submissions = await this.prisma.documentSubmission.findMany({
      where: {
        employeeId,
        documentTypeId,
        deletedAt: null
      },
      orderBy: { version: "desc" }
    });

    return submissions.map(PrismaDocumentSubmissionMapper.toDomain);
  }

  async create(submission: DocumentSubmission): Promise<DocumentSubmission> {
    const raw = await this.prisma.documentSubmission.create({
      data: PrismaDocumentSubmissionMapper.toPrisma(submission)
    });

    return PrismaDocumentSubmissionMapper.toDomain(raw);
  }

  async update(submission: DocumentSubmission): Promise<void> {
    await this.prisma.documentSubmission.update({
      where: { id: submission.id.toString() },
      data: { status: submission.status }
    });
  }

  async submit(
    previous: DocumentSubmission | null,
    next: DocumentSubmission
  ): Promise<DocumentSubmission> {
    const created = await this.prisma.$transaction(async tx => {
      if (previous) {
        await tx.documentSubmission.update({
          where: { id: previous.id.toString() },
          data: { status: previous.status }
        });
      }

      return tx.documentSubmission.create({
        data: PrismaDocumentSubmissionMapper.toPrisma(next)
      });
    });

    return PrismaDocumentSubmissionMapper.toDomain(created);
  }
}

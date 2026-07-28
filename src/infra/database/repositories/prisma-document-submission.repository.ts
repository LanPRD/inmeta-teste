import { DocumentSubmission } from "@/domain/entities";
import { SubmissionStatus } from "@/domain/enums";
import {
  DocumentSubmissionRepository,
  type FindPendingResult,
  type GetStatsResult,
  type MostPendingResult,
  type RecentSubmissionResult
} from "@/domain/repositories/document-submission-repository";
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
      status: SubmissionStatus.ACTIVE,
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
        status: SubmissionStatus.ACTIVE,
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

  async findPending(
    page: number,
    limit: number
  ): Promise<{ data: FindPendingResult[]; total: number }> {
    const [activeSubmissions, allLinks] = await Promise.all([
      this.prisma.documentSubmission.findMany({
        where: {
          status: SubmissionStatus.ACTIVE,
          deletedAt: null
        },
        select: { employeeId: true, documentTypeId: true }
      }),
      this.prisma.employeeDocumentType.findMany({
        where: { unlinkedAt: null },
        include: {
          employee: { select: { id: true, name: true, deletedAt: true } },
          documentType: { select: { id: true, name: true, deletedAt: true } }
        },
        orderBy: { linkedAt: "asc" }
      })
    ]);

    const submittedKeys = new Set(
      activeSubmissions.map(s => `${s.employeeId}:${s.documentTypeId}`)
    );

    const pending = allLinks
      .filter(
        l =>
          !submittedKeys.has(`${l.employeeId}:${l.documentTypeId}`) &&
          l.employee.deletedAt === null &&
          l.documentType.deletedAt === null
      )
      .map(l => ({
        employeeId: l.employeeId,
        employeeName: l.employee.name,
        documentTypeId: l.documentTypeId,
        documentTypeName: l.documentType.name,
        linkedAt: l.linkedAt
      }));

    const total = pending.length;
    const offset = (page - 1) * limit;
    const data = pending.slice(offset, offset + limit);

    return { data, total };
  }

  async getStats(): Promise<GetStatsResult> {
    const [activeSubmissions, allLinks, recentSubmissions] = await Promise.all([
      this.prisma.documentSubmission.findMany({
        where: {
          status: SubmissionStatus.ACTIVE,
          deletedAt: null
        },
        select: { employeeId: true, documentTypeId: true }
      }),
      this.prisma.employeeDocumentType.findMany({
        where: { unlinkedAt: null },
        include: {
          employee: { select: { deletedAt: true } },
          documentType: { select: { id: true, name: true, deletedAt: true } }
        }
      }),
      this.prisma.documentSubmission.findMany({
        where: {
          status: SubmissionStatus.ACTIVE,
          deletedAt: null
        },
        include: {
          employee: { select: { id: true, name: true } },
          documentType: { select: { id: true, name: true } }
        },
        orderBy: { submittedAt: "desc" },
        take: 10
      })
    ]);

    const submittedKeys = new Set(
      activeSubmissions.map(s => `${s.employeeId}:${s.documentTypeId}`)
    );

    const activeLinks = allLinks.filter(
      l => l.employee.deletedAt === null && l.documentType.deletedAt === null
    );

    const totalRequired = activeLinks.length;
    const totalFulfilled = activeLinks.filter(l =>
      submittedKeys.has(`${l.employeeId}:${l.documentTypeId}`)
    ).length;

    const pendingByType = new Map<string, MostPendingResult>();

    for (const link of activeLinks) {
      if (!submittedKeys.has(`${link.employeeId}:${link.documentTypeId}`)) {
        const existing = pendingByType.get(link.documentTypeId);

        if (existing) {
          existing.pendingCount++;
        } else {
          pendingByType.set(link.documentTypeId, {
            documentTypeId: link.documentTypeId,
            documentTypeName: link.documentType.name,
            pendingCount: 1
          });
        }
      }
    }

    const mostPending = Array.from(pendingByType.values())
      .sort((a, b) => b.pendingCount - a.pendingCount)
      .slice(0, 5);

    const recent: RecentSubmissionResult[] = recentSubmissions.map(s => ({
      employeeId: s.employeeId,
      employeeName: s.employee.name,
      documentTypeId: s.documentTypeId,
      documentTypeName: s.documentType.name,
      version: s.version,
      submittedAt: s.submittedAt
    }));

    return {
      totalRequired,
      totalFulfilled,
      mostPending,
      recentSubmissions: recent
    };
  }

  async submit(
    previous: DocumentSubmission | null,
    next: DocumentSubmission
  ): Promise<DocumentSubmission> {
    const created = await this.prisma.$transaction(
      async tx => {
        if (previous) {
          await tx.documentSubmission.update({
            where: { id: previous.id.toString() },
            data: { status: previous.status }
          });
        }

        return tx.documentSubmission.create({
          data: PrismaDocumentSubmissionMapper.toPrisma(next)
        });
      },
      { isolationLevel: "Serializable" }
    );

    return PrismaDocumentSubmissionMapper.toDomain(created);
  }
}

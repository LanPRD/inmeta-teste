import { DocumentSubmission } from "@/domain/entities";
import { SubmissionStatus } from "@/domain/enums";
import { DocumentSubmissionRepository } from "@/domain/repositories/document-submission-repository";
import { PrismaModule } from "@/infra/database/prisma/prisma.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { PrismaDocumentSubmissionRepository } from "@/infra/database/repositories/prisma-document-submission.repository";
import { EnvModule } from "@/infra/env/env.module";
import { Test, type TestingModule } from "@nestjs/testing";
import { cleanDatabase } from "../../helpers/clean-database";

describe("PrismaDocumentSubmissionRepository (integration)", () => {
  let module: TestingModule;
  let repo: DocumentSubmissionRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [EnvModule, PrismaModule],
      providers: [
        {
          provide: DocumentSubmissionRepository,
          useClass: PrismaDocumentSubmissionRepository
        }
      ]
    }).compile();

    repo = module.get<DocumentSubmissionRepository>(
      DocumentSubmissionRepository
    );
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await module.close();
  });

  // ---- helpers ----

  async function createEmployee(name: string, email: string): Promise<string> {
    const created = await prisma.employee.create({
      data: { name, email }
    });
    return created.id;
  }

  async function createDocumentType(name: string): Promise<string> {
    const created = await prisma.documentType.create({
      data: { name }
    });
    return created.id;
  }

  async function createLink(
    employeeId: string,
    documentTypeId: string
  ): Promise<string> {
    const created = await prisma.employeeDocumentType.create({
      data: { employeeId, documentTypeId }
    });
    return created.id;
  }

  function makeSubmission(
    employeeId: string,
    documentTypeId: string,
    version: number,
    status: SubmissionStatus = SubmissionStatus.ACTIVE
  ): DocumentSubmission {
    return DocumentSubmission.create({
      employeeId,
      documentTypeId,
      version,
      status
    });
  }

  // ---- tests ----

  describe("create + findActiveVersion", () => {
    it("creates a submission and finds the active version", async () => {
      // Arrange
      const empId = await createEmployee("John", "john@test.com");
      const dtId = await createDocumentType("ASO");
      const submission = makeSubmission(empId, dtId, 1);

      // Act
      const created = await repo.create(submission);
      const found = await repo.findActiveVersion(empId, dtId);

      // Assert
      expect(found).not.toBeNull();
      expect(found?.version).toBe(1);
      expect(found?.employeeId).toBe(empId);
      expect(found?.documentTypeId).toBe(dtId);
      expect(created.status).toBe(SubmissionStatus.ACTIVE);
    });

    it("returns null when no active version exists", async () => {
      // Arrange
      const empId = await createEmployee("Ghost", "ghost@test.com");
      const dtId = await createDocumentType("ASO");

      // Act
      const found = await repo.findActiveVersion(empId, dtId);

      // Assert
      expect(found).toBeNull();
    });

    it("returns null for SUPERSEDED submission", async () => {
      // Arrange
      const empId = await createEmployee("Jane", "jane@test.com");
      const dtId = await createDocumentType("NR-7");
      const submission = DocumentSubmission.create({
        employeeId: empId,
        documentTypeId: dtId,
        version: 1,
        status: SubmissionStatus.SUPERSEDED
      });
      await repo.create(submission);

      // Act
      const found = await repo.findActiveVersion(empId, dtId);

      // Assert
      expect(found).toBeNull();
    });
  });

  describe("findActiveByEmployee", () => {
    it("returns all active submissions for an employee", async () => {
      // Arrange
      const empId = await createEmployee("Alice", "alice@test.com");
      const dt1 = await createDocumentType("ASO");
      const dt2 = await createDocumentType("NR-7");
      await repo.create(makeSubmission(empId, dt1, 1));
      await repo.create(makeSubmission(empId, dt2, 1));

      // Act
      const result = await repo.findActiveByEmployee(empId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(s => s.employeeId === empId)).toBe(true);
    });

    it("filters by documentTypeId when provided", async () => {
      // Arrange
      const empId = await createEmployee("Bob", "bob@test.com");
      const dt1 = await createDocumentType("ASO");
      const dt2 = await createDocumentType("NR-7");
      await repo.create(makeSubmission(empId, dt1, 1));
      await repo.create(makeSubmission(empId, dt2, 1));

      // Act
      const result = await repo.findActiveByEmployee(empId, dt1);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].documentTypeId).toBe(dt1);
    });

    it("returns empty array when employee has no submissions", async () => {
      // Arrange
      const empId = await createEmployee("Ghost", "ghost@test.com");

      // Act
      const result = await repo.findActiveByEmployee(empId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findHistory", () => {
    it("returns all versions ordered by version desc", async () => {
      // Arrange
      const empId = await createEmployee("Carl", "carl@test.com");
      const dtId = await createDocumentType("ASO");
      await repo.create(
        makeSubmission(empId, dtId, 1, SubmissionStatus.SUPERSEDED)
      );
      await repo.create(
        makeSubmission(empId, dtId, 2, SubmissionStatus.SUPERSEDED)
      );
      await repo.create(
        makeSubmission(empId, dtId, 3, SubmissionStatus.ACTIVE)
      );

      // Act
      const history = await repo.findHistory(empId, dtId);

      // Assert
      expect(history).toHaveLength(3);
      expect(history[0].version).toBe(3);
      expect(history[1].version).toBe(2);
      expect(history[2].version).toBe(1);
    });

    it("returns empty array when no submissions exist", async () => {
      // Act
      const history = await repo.findHistory(
        "nonexistent-emp",
        "nonexistent-dt"
      );

      // Assert
      expect(history).toEqual([]);
    });

    it("excludes soft-deleted submissions by default", async () => {
      // Arrange
      const empId = await createEmployee("Iris", "iris@test.com");
      const dtId = await createDocumentType("ASO");
      const created = await repo.create(
        makeSubmission(empId, dtId, 1, SubmissionStatus.SUPERSEDED)
      );
      await prisma.documentSubmission.update({
        where: { id: created.id.toString() },
        data: { deletedAt: new Date() }
      });

      // Act
      const history = await repo.findHistory(empId, dtId);

      // Assert
      expect(history).toEqual([]);
    });

    it("includes soft-deleted submissions when includeDeleted is true", async () => {
      // Arrange
      const empId = await createEmployee("Jonas", "jonas@test.com");
      const dtId = await createDocumentType("ASO");
      const created = await repo.create(
        makeSubmission(empId, dtId, 1, SubmissionStatus.SUPERSEDED)
      );
      await prisma.documentSubmission.update({
        where: { id: created.id.toString() },
        data: { deletedAt: new Date() }
      });

      // Act
      const history = await repo.findHistory(empId, dtId, true);

      // Assert
      expect(history).toHaveLength(1);
      expect(history[0].version).toBe(1);
    });
  });

  describe("submit", () => {
    it("creates first version (previous = null)", async () => {
      // Arrange
      const empId = await createEmployee("Diana", "diana@test.com");
      const dtId = await createDocumentType("ASO");
      const next = makeSubmission(empId, dtId, 1);

      // Act
      const created = await repo.submit(null, next);
      const active = await repo.findActiveVersion(empId, dtId);

      // Assert
      expect(created.version).toBe(1);
      expect(created.status).toBe(SubmissionStatus.ACTIVE);
      expect(active).not.toBeNull();
    });

    it("supersedes previous version and creates next", async () => {
      // Arrange
      const empId = await createEmployee("Eve", "eve@test.com");
      const dtId = await createDocumentType("ASO");

      const v1 = await repo.submit(null, makeSubmission(empId, dtId, 1));
      const previous = DocumentSubmission.create(
        {
          employeeId: empId,
          documentTypeId: dtId,
          version: 1,
          status: SubmissionStatus.SUPERSEDED
        },
        v1.id
      );
      const next = makeSubmission(empId, dtId, 2);

      // Act
      const created = await repo.submit(previous, next);

      // Assert
      const active = await repo.findActiveVersion(empId, dtId);
      expect(active).not.toBeNull();
      expect(active?.version).toBe(2);

      const history = await repo.findHistory(empId, dtId);
      expect(history).toHaveLength(2);
    });

    it("increments version correctly across multiple submissions", async () => {
      // Arrange
      const empId = await createEmployee("Frank", "frank@test.com");
      const dtId = await createDocumentType("ASO");

      // Act — v1
      const v1 = await repo.submit(null, makeSubmission(empId, dtId, 1));

      // Act — v2
      const prevV1 = DocumentSubmission.create(
        {
          employeeId: empId,
          documentTypeId: dtId,
          version: 1,
          status: SubmissionStatus.SUPERSEDED
        },
        v1.id
      );
      const v2 = await repo.submit(prevV1, makeSubmission(empId, dtId, 2));

      // Act — v3
      const prevV2 = DocumentSubmission.create(
        {
          employeeId: empId,
          documentTypeId: dtId,
          version: 2,
          status: SubmissionStatus.SUPERSEDED
        },
        v2.id
      );
      const v3 = await repo.submit(prevV2, makeSubmission(empId, dtId, 3));

      // Assert
      const history = await repo.findHistory(empId, dtId);
      expect(history).toHaveLength(3);

      const active = await repo.findActiveVersion(empId, dtId);
      expect(active?.version).toBe(3);
    });
  });

  describe("findPending", () => {
    it("returns employees with active links but no submission", async () => {
      // Arrange
      const empId = await createEmployee("Grace", "grace@test.com");
      const dtId = await createDocumentType("ASO");
      await createLink(empId, dtId);

      // Act
      const result = await repo.findPending(1, 10);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].employeeId).toBe(empId);
      expect(result.data[0].employeeName).toBe("Grace");
      expect(result.data[0].documentTypeId).toBe(dtId);
      expect(result.data[0].documentTypeName).toBe("ASO");
      expect(result.total).toBe(1);
    });

    it("does not return employees with active submission", async () => {
      // Arrange
      const empId = await createEmployee("Hank", "hank@test.com");
      const dtId = await createDocumentType("ASO");
      await createLink(empId, dtId);
      await repo.create(makeSubmission(empId, dtId, 1));

      // Act
      const result = await repo.findPending(1, 10);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("excludes soft-deleted employees", async () => {
      // Arrange
      const empId = await createEmployee("DeletedEmp", "deleted@test.com");
      const dtId = await createDocumentType("ASO");
      await createLink(empId, dtId);
      await prisma.employee.update({
        where: { id: empId },
        data: { deletedAt: new Date() }
      });

      // Act
      const result = await repo.findPending(1, 10);

      // Assert
      expect(result.data).toHaveLength(0);
    });

    it("supports pagination", async () => {
      // Arrange
      const emp1 = await createEmployee("Emp1", "emp1@test.com");
      const emp2 = await createEmployee("Emp2", "emp2@test.com");
      const dt1 = await createDocumentType("ASO");
      const dt2 = await createDocumentType("NR-7");
      await createLink(emp1, dt1);
      await createLink(emp2, dt2);

      // Page 1
      const page1 = await repo.findPending(1, 1);
      expect(page1.data).toHaveLength(1);
      expect(page1.total).toBe(2);

      // Page 2
      const page2 = await repo.findPending(2, 1);
      expect(page2.data).toHaveLength(1);
    });

    it("filters by employeeId", async () => {
      // Arrange
      const emp1 = await createEmployee("Filter1", "filter1@test.com");
      const emp2 = await createEmployee("Filter2", "filter2@test.com");
      const dtId = await createDocumentType("ASO");
      await createLink(emp1, dtId);
      await createLink(emp2, dtId);

      // Act
      const result = await repo.findPending(1, 10, { employeeId: emp1 });

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].employeeId).toBe(emp1);
      expect(result.total).toBe(1);
    });

    it("filters by documentTypeId", async () => {
      // Arrange
      const empId = await createEmployee("FilterDt", "filterdt@test.com");
      const dt1 = await createDocumentType("ASO");
      const dt2 = await createDocumentType("NR-7");
      await createLink(empId, dt1);
      await createLink(empId, dt2);

      // Act
      const result = await repo.findPending(1, 10, { documentTypeId: dt2 });

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].documentTypeId).toBe(dt2);
      expect(result.total).toBe(1);
    });
  });

  describe("getStats", () => {
    it("returns correct totals when all links are fulfilled", async () => {
      // Arrange
      const emp1 = await createEmployee("Emp1", "emp1@test.com");
      const emp2 = await createEmployee("Emp2", "emp2@test.com");
      const dt1 = await createDocumentType("ASO");
      const dt2 = await createDocumentType("NR-7");

      await createLink(emp1, dt1);
      await createLink(emp1, dt2);
      await createLink(emp2, dt1);

      await repo.create(makeSubmission(emp1, dt1, 1));
      await repo.create(makeSubmission(emp1, dt2, 1));
      await repo.create(makeSubmission(emp2, dt1, 1));

      // Act
      const stats = await repo.getStats();

      // Assert
      expect(stats.totalRequired).toBe(3);
      expect(stats.totalFulfilled).toBe(3);
      expect(stats.mostPending).toHaveLength(0);
    });

    it("identifies most pending document types", async () => {
      // Arrange
      const emp1 = await createEmployee("Emp1", "emp1@test.com");
      const emp2 = await createEmployee("Emp2", "emp2@test.com");
      const emp3 = await createEmployee("Emp3", "emp3@test.com");
      const asoId = await createDocumentType("ASO");
      const nr7Id = await createDocumentType("NR-7");

      // 2 links for ASO (both unfulfilled), 1 link for NR-7 (unfulfilled)
      await createLink(emp1, asoId);
      await createLink(emp2, asoId);
      await createLink(emp3, nr7Id);

      // Act
      const stats = await repo.getStats();

      // Assert
      expect(stats.totalRequired).toBe(3);
      expect(stats.totalFulfilled).toBe(0);

      const asoStats = stats.mostPending.find(m => m.documentTypeId === asoId);
      expect(asoStats?.pendingCount).toBe(2);

      const nr7Stats = stats.mostPending.find(m => m.documentTypeId === nr7Id);
      expect(nr7Stats?.pendingCount).toBe(1);
    });

    it("includes recent submissions in stats", async () => {
      // Arrange
      const empId = await createEmployee("Recent", "recent@test.com");
      const dtId = await createDocumentType("ASO");
      await createLink(empId, dtId);
      await repo.create(makeSubmission(empId, dtId, 1));

      // Act
      const stats = await repo.getStats();

      // Assert
      expect(stats.recentSubmissions).toHaveLength(1);
      expect(stats.recentSubmissions[0].employeeName).toBe("Recent");
      expect(stats.recentSubmissions[0].documentTypeName).toBe("ASO");
      expect(stats.recentSubmissions[0].version).toBe(1);
    });

    it("excludes deleted employees from stats", async () => {
      // Arrange
      const empId = await createEmployee("ToBeDeleted", "todelete@test.com");
      const dtId = await createDocumentType("ASO");
      await createLink(empId, dtId);
      await prisma.employee.update({
        where: { id: empId },
        data: { deletedAt: new Date() }
      });

      // Act
      const stats = await repo.getStats();

      // Assert
      expect(stats.totalRequired).toBe(0);
    });

    it("excludes recent submissions from deleted employees", async () => {
      // Arrange
      const empId = await createEmployee("DeletedRecent", "delrecent@test.com");
      const dtId = await createDocumentType("ASO");
      await createLink(empId, dtId);
      await repo.create(makeSubmission(empId, dtId, 1));
      await prisma.employee.update({
        where: { id: empId },
        data: { deletedAt: new Date() }
      });

      // Act
      const stats = await repo.getStats();

      // Assert
      expect(stats.recentSubmissions).toHaveLength(0);
    });

    it("excludes recent submissions from deleted document types", async () => {
      // Arrange
      const empId = await createEmployee("DtRecent", "dtrecent@test.com");
      const dtId = await createDocumentType("ASO");
      await createLink(empId, dtId);
      await repo.create(makeSubmission(empId, dtId, 1));
      await prisma.documentType.update({
        where: { id: dtId },
        data: { deletedAt: new Date() }
      });

      // Act
      const stats = await repo.getStats();

      // Assert
      expect(stats.recentSubmissions).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("updates submission status", async () => {
      // Arrange
      const empId = await createEmployee("Update", "update@test.com");
      const dtId = await createDocumentType("ASO");
      const sub = await repo.create(makeSubmission(empId, dtId, 1));

      // Act
      const updated = DocumentSubmission.create(
        {
          employeeId: empId,
          documentTypeId: dtId,
          version: 1,
          status: SubmissionStatus.SUPERSEDED
        },
        sub.id
      );
      await repo.update(updated);
      const found = await repo.findActiveVersion(empId, dtId);

      // Assert
      expect(found).toBeNull();
    });
  });
});

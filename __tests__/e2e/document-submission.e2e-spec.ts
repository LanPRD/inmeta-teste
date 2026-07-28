import { PrismaService } from "@/infra/database/prisma/prisma.service";
import {
  FastifyAdapter,
  type NestFastifyApplication
} from "@nestjs/platform-fastify";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { cleanDatabase } from "../helpers/clean-database";

describe("Document Submission (e2e)", () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    prisma = moduleFixture.get(PrismaService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  async function createEmployee(name: string, email: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post("/employees")
      .send({ name, email });
    return res.body.data.id;
  }

  async function createDocumentType(name: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post("/document-types")
      .send({ name });
    return res.body.data.id;
  }

  async function linkDocumentType(
    employeeId: string,
    documentTypeId: string
  ): Promise<void> {
    await request(app.getHttpServer()).post(
      `/employees/${employeeId}/document-types/${documentTypeId}`
    );
  }

  // ---- tests ----

  describe("POST /employees/:employeeId/documents", () => {
    it("returns 201 and submits version 1", async () => {
      // Arrange
      const empId = await createEmployee("Submit1", "submit1@e2e.test");
      const dtId = await createDocumentType("ASO");
      await linkDocumentType(empId, dtId);

      // Act
      const res = await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        employeeId: empId,
        documentTypeId: dtId,
        version: 1,
        status: "ACTIVE"
      });
    });

    it("returns 201 and creates version 2 on re-submit", async () => {
      // Arrange
      const empId = await createEmployee("Submit2", "submit2@e2e.test");
      const dtId = await createDocumentType("ASO");
      await linkDocumentType(empId, dtId);

      // Submit v1
      await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });

      // Act — resubmit
      const res = await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.data.version).toBe(2);
    });

    it("returns 400 when documentTypeId is missing", async () => {
      // Arrange
      const empId = await createEmployee("BadReq", "badreq@e2e.test");

      // Act
      const res = await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({});

      // Assert
      expect(res.status).toBe(400);
    });

    it("returns 404 when employee does not exist", async () => {
      // Arrange
      const dtId = await createDocumentType("ASO");

      // Act
      const res = await request(app.getHttpServer())
        .post("/employees/nonexistent-id/documents")
        .send({ documentTypeId: dtId });

      // Assert
      expect(res.status).toBe(404);
    });

    it("returns 404 when document type does not exist", async () => {
      // Arrange
      const empId = await createEmployee("NoDocType", "nodoctype@e2e.test");

      // Act
      const res = await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: "00000000-0000-0000-0000-000000000000" });

      // Assert
      expect(res.status).toBe(404);
    });

    it("returns 404 when document type is not linked to the employee", async () => {
      // Arrange
      const empId = await createEmployee("NotLinked", "notlinked@e2e.test");
      const dtId = await createDocumentType("ASO");

      // Act — never linked
      const res = await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });

      // Assert
      expect(res.status).toBe(404);
    });
  });

  describe("GET /employees/:employeeId/documents", () => {
    it("returns active submissions", async () => {
      // Arrange
      const empId = await createEmployee("Active", "active@e2e.test");
      const dtId = await createDocumentType("ASO");
      await linkDocumentType(empId, dtId);
      await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });

      // Act
      const res = await request(app.getHttpServer()).get(
        `/employees/${empId}/documents`
      );

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].version).toBe(1);
    });

    it("returns empty array when no submissions", async () => {
      // Arrange
      const empId = await createEmployee("NoSub", "nosub@e2e.test");

      // Act
      const res = await request(app.getHttpServer()).get(
        `/employees/${empId}/documents`
      );

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /employees/:employeeId/documents/:documentTypeId/history", () => {
    it("returns all versions ordered by version desc", async () => {
      // Arrange
      const empId = await createEmployee("Hist", "hist@e2e.test");
      const dtId = await createDocumentType("ASO");
      await linkDocumentType(empId, dtId);

      await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });
      await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });

      // Act
      const res = await request(app.getHttpServer()).get(
        `/employees/${empId}/documents/${dtId}/history`
      );

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].version).toBe(2);
      expect(res.body.data[1].version).toBe(1);
    });

    it("stays accessible after the employee is soft-deleted", async () => {
      // Arrange
      const empId = await createEmployee("HistDel", "histdel@e2e.test");
      const dtId = await createDocumentType("ASO");
      await linkDocumentType(empId, dtId);
      await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });

      await request(app.getHttpServer()).delete(`/employees/${empId}`);

      // Act
      const res = await request(app.getHttpServer()).get(
        `/employees/${empId}/documents/${dtId}/history`
      );

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it("returns empty array when no submissions exist", async () => {
      // Arrange
      const empId = await createEmployee("NoHist", "nohist@e2e.test");
      const dtId = await createDocumentType("ASO");

      // Act
      const res = await request(app.getHttpServer()).get(
        `/employees/${empId}/documents/${dtId}/history`
      );

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it("excludes soft-deleted versions by default and includes them with includeDeleted=true", async () => {
      // Arrange
      const empId = await createEmployee("HistDeleted", "histdeleted@e2e.test");
      const dtId = await createDocumentType("ASO");
      await linkDocumentType(empId, dtId);
      const submitRes = await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });

      await prisma.documentSubmission.update({
        where: { id: submitRes.body.data.id },
        data: { deletedAt: new Date() }
      });

      // Act
      const withoutDeleted = await request(app.getHttpServer()).get(
        `/employees/${empId}/documents/${dtId}/history`
      );
      const withDeleted = await request(app.getHttpServer())
        .get(`/employees/${empId}/documents/${dtId}/history`)
        .query({ includeDeleted: "true" });

      // Assert
      expect(withoutDeleted.body.data).toEqual([]);
      expect(withDeleted.body.data).toHaveLength(1);
    });
  });

  describe("GET /documents/pending", () => {
    it("returns employees with links but no submissions", async () => {
      // Arrange
      const empId = await createEmployee("Pending", "pending@e2e.test");
      const dtId = await createDocumentType("ASO");
      await linkDocumentType(empId, dtId);

      // Act
      const res = await request(app.getHttpServer())
        .get("/documents/pending")
        .query({ page: 1, limit: 10 });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].employeeName).toBe("Pending");
      expect(res.body.data[0].documentTypeName).toBe("ASO");
    });

    it("excludes employees with active submissions", async () => {
      // Arrange
      const empId = await createEmployee("Fulfilled", "fulfilled@e2e.test");
      const dtId = await createDocumentType("ASO");
      await linkDocumentType(empId, dtId);
      await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });

      // Act
      const res = await request(app.getHttpServer())
        .get("/documents/pending")
        .query({ page: 1, limit: 10 });

      // Assert
      expect(res.body.data).toHaveLength(0);
    });

    it("filters by employeeId", async () => {
      // Arrange
      const empA = await createEmployee("PendingA", "pendinga@e2e.test");
      const empB = await createEmployee("PendingB", "pendingb@e2e.test");
      const dtId = await createDocumentType("ASO");
      await linkDocumentType(empA, dtId);
      await linkDocumentType(empB, dtId);

      // Act
      const res = await request(app.getHttpServer())
        .get("/documents/pending")
        .query({ page: 1, limit: 10, employeeId: empA });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].employeeId).toBe(empA);
    });

    it("filters by documentTypeId", async () => {
      // Arrange
      const empId = await createEmployee("PendingFilter", "pendingf@e2e.test");
      const dt1 = await createDocumentType("ASO");
      const dt2 = await createDocumentType("NR-7");
      await linkDocumentType(empId, dt1);
      await linkDocumentType(empId, dt2);

      // Act
      const res = await request(app.getHttpServer())
        .get("/documents/pending")
        .query({ page: 1, limit: 10, documentTypeId: dt2 });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].documentTypeId).toBe(dt2);
    });
  });

  describe("GET /stats/dashboard", () => {
    it("returns completion statistics", async () => {
      // Arrange
      const empId = await createEmployee("Stats", "stats@e2e.test");
      const dtId = await createDocumentType("ASO");
      await linkDocumentType(empId, dtId);
      await request(app.getHttpServer())
        .post(`/employees/${empId}/documents`)
        .send({ documentTypeId: dtId });

      // Act
      const res = await request(app.getHttpServer()).get("/stats/dashboard");

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.completion).toMatchObject({
        totalRequired: 1,
        totalFulfilled: 1
      });
      expect(res.body.data.mostPendingDocumentTypes).toBeDefined();
      expect(res.body.data.recentSubmissions).toHaveLength(1);
    });
  });
});

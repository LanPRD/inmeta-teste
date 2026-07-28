import { PrismaService } from "@/infra/database/prisma/prisma.service";
import {
  FastifyAdapter,
  type NestFastifyApplication
} from "@nestjs/platform-fastify";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { cleanDatabase } from "../helpers/clean-database";

describe("Document Link (e2e)", () => {
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

  // ---- tests ----

  describe("POST /employees/:employeeId/document-types/:documentTypeId", () => {
    it("returns 201 and creates a link", async () => {
      // Arrange
      const empId = await createEmployee("LinkTest", "link@e2e.test");
      const dtId = await createDocumentType("ASO");

      // Act
      const res = await request(app.getHttpServer()).post(
        `/employees/${empId}/document-types/${dtId}`
      );

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        employeeId: empId,
        documentTypeId: dtId
      });
      expect(res.body.data.linkedAt).toBeDefined();
    });

    it("returns 409 when link already exists", async () => {
      // Arrange
      const empId = await createEmployee("DupLink", "duplink@e2e.test");
      const dtId = await createDocumentType("ASO");
      await request(app.getHttpServer()).post(
        `/employees/${empId}/document-types/${dtId}`
      );

      // Act
      const res = await request(app.getHttpServer()).post(
        `/employees/${empId}/document-types/${dtId}`
      );

      // Assert
      expect(res.status).toBe(409);
    });

    it("returns 404 when employee does not exist", async () => {
      // Arrange
      const dtId = await createDocumentType("ASO");

      // Act
      const res = await request(app.getHttpServer()).post(
        "/employees/nonexistent-id/document-types/" + dtId
      );

      // Assert
      expect(res.status).toBe(404);
    });
  });

  describe("GET /employees/:employeeId/document-types", () => {
    it("returns linked document types with status", async () => {
      // Arrange
      const empId = await createEmployee("Linked", "linked@e2e.test");
      const dtId = await createDocumentType("ASO");
      await request(app.getHttpServer()).post(
        `/employees/${empId}/document-types/${dtId}`
      );

      // Act
      const res = await request(app.getHttpServer()).get(
        `/employees/${empId}/document-types`
      );

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe("PENDING");
    });

    it("returns empty array when employee has no links", async () => {
      // Arrange
      const empId = await createEmployee("NoLinks", "nolinks@e2e.test");

      // Act
      const res = await request(app.getHttpServer()).get(
        `/employees/${empId}/document-types`
      );

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("DELETE /employees/:employeeId/document-types/:documentTypeId", () => {
    it("returns 204 and removes the link", async () => {
      // Arrange
      const empId = await createEmployee("Unlink", "unlink@e2e.test");
      const dtId = await createDocumentType("ASO");
      await request(app.getHttpServer()).post(
        `/employees/${empId}/document-types/${dtId}`
      );

      // Act
      const res = await request(app.getHttpServer()).delete(
        `/employees/${empId}/document-types/${dtId}`
      );

      // Assert
      expect(res.status).toBe(204);

      const getRes = await request(app.getHttpServer()).get(
        `/employees/${empId}/document-types`
      );
      expect(getRes.body.data).toHaveLength(0);
    });
  });
});

import { PrismaService } from "@/infra/database/prisma/prisma.service";
import {
  FastifyAdapter,
  type NestFastifyApplication
} from "@nestjs/platform-fastify";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { cleanDatabase } from "../helpers/clean-database";

describe("DocumentType (e2e)", () => {
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

  function postDocType(body: Record<string, unknown>) {
    return request(app.getHttpServer()).post("/document-types").send(body);
  }

  // ---- tests ----

  describe("POST /document-types", () => {
    it("returns 201 and creates a document type", async () => {
      // Act
      const res = await postDocType({
        name: "ASO",
        description: "Atestado de Saúde Ocupacional"
      });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        name: "ASO",
        description: "Atestado de Saúde Ocupacional"
      });
      expect(res.body.data.id).toBeDefined();
    });

    it("returns 201 without description (optional)", async () => {
      // Act
      const res = await postDocType({ name: "NR-7" });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("NR-7");
    });

    it("returns 409 when name already exists", async () => {
      // Arrange
      await postDocType({ name: "ASO" });

      // Act
      const res = await postDocType({ name: "ASO" });

      // Assert
      expect(res.status).toBe(409);
    });

    it("returns 400 when name is empty", async () => {
      // Act
      const res = await postDocType({ name: "" });

      // Assert
      expect(res.status).toBe(400);
    });
  });

  describe("GET /document-types", () => {
    it("returns paginated list", async () => {
      // Arrange
      await postDocType({ name: "ASO" });
      await postDocType({ name: "NR-7" });

      // Act
      const res = await request(app.getHttpServer())
        .get("/document-types")
        .query({ page: 1, limit: 1 });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(2);
    });

    it("filters by name", async () => {
      // Arrange
      await postDocType({ name: "ASO" });
      await postDocType({ name: "PCMSO" });

      // Act
      const res = await request(app.getHttpServer())
        .get("/document-types")
        .query({ name: "aso" });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("ASO");
    });
  });

  describe("GET /document-types/:id", () => {
    it("returns 200 with document type data", async () => {
      // Arrange
      const createRes = await postDocType({ name: "FindMe" });
      const { id } = createRes.body.data;

      // Act
      const res = await request(app.getHttpServer()).get(
        `/document-types/${id}`
      );

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("FindMe");
    });

    it("returns 404 for non-existent ID", async () => {
      // Act
      const res = await request(app.getHttpServer()).get(
        "/document-types/00000000-0000-0000-0000-000000000000"
      );

      // Assert
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /document-types/:id", () => {
    it("returns 200 with updated document type", async () => {
      // Arrange
      const createRes = await postDocType({
        name: "Old",
        description: "Old desc"
      });
      const { id } = createRes.body.data;

      // Act
      const res = await request(app.getHttpServer())
        .patch(`/document-types/${id}`)
        .send({ name: "New", description: "New desc" });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("New");
      expect(res.body.data.description).toBe("New desc");
    });

    it("returns 400 when no fields provided", async () => {
      // Arrange
      const createRes = await postDocType({ name: "Test" });
      const { id } = createRes.body.data;

      // Act
      const res = await request(app.getHttpServer())
        .patch(`/document-types/${id}`)
        .send({});

      // Assert
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /document-types/:id", () => {
    it("returns 204 and soft-deletes", async () => {
      // Arrange
      const createRes = await postDocType({ name: "ToDelete" });
      const { id } = createRes.body.data;

      // Act
      const deleteRes = await request(app.getHttpServer()).delete(
        `/document-types/${id}`
      );

      // Assert
      expect(deleteRes.status).toBe(204);

      const getRes = await request(app.getHttpServer()).get(
        `/document-types/${id}`
      );
      expect(getRes.status).toBe(404);
    });
  });
});

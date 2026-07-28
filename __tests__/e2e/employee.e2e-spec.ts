import { PrismaService } from "@/infra/database/prisma/prisma.service";
import {
  FastifyAdapter,
  type NestFastifyApplication
} from "@nestjs/platform-fastify";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { cleanDatabase } from "../helpers/clean-database";

describe("Employee (e2e)", () => {
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

  function postEmployee(body: Record<string, unknown>) {
    return request(app.getHttpServer()).post("/employees").send(body);
  }

  // ---- tests ----

  describe("POST /employees", () => {
    it("returns 201 and creates an employee", async () => {
      // Arrange & Act
      const res = await postEmployee({
        name: "John Doe",
        email: "john@e2e.test"
      });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        name: "John Doe",
        email: "john@e2e.test"
      });
      expect(res.body.data.id).toBeDefined();
    });

    it("returns 409 when email already exists", async () => {
      // Arrange
      await postEmployee({ name: "John", email: "dup@e2e.test" });

      // Act
      const res = await postEmployee({ name: "Other", email: "dup@e2e.test" });

      // Assert
      expect(res.status).toBe(409);
    });

    it("returns 400 when name is empty", async () => {
      // Act
      const res = await postEmployee({ name: "", email: "test@e2e.test" });

      // Assert
      expect(res.status).toBe(400);
    });

    it("returns 400 when email is invalid", async () => {
      // Act
      const res = await postEmployee({ name: "John", email: "not-email" });

      // Assert
      expect(res.status).toBe(400);
    });
  });

  describe("GET /employees", () => {
    it("returns paginated list", async () => {
      // Arrange
      await postEmployee({ name: "A", email: "a@e2e.test" });
      await postEmployee({ name: "B", email: "b@e2e.test" });

      // Act
      const res = await request(app.getHttpServer())
        .get("/employees")
        .query({ page: 1, limit: 1 });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 1, total: 2 });
    });

    it("filters by name", async () => {
      // Arrange
      await postEmployee({ name: "Alice", email: "alice@e2e.test" });
      await postEmployee({ name: "Bob", email: "bob@e2e.test" });

      // Act
      const res = await request(app.getHttpServer())
        .get("/employees")
        .query({ name: "alice" });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Alice");
    });
  });

  describe("GET /employees/:id", () => {
    it("returns 200 with employee data", async () => {
      // Arrange
      const createRes = await postEmployee({
        name: "FindMe",
        email: "findme@e2e.test"
      });
      const { id } = createRes.body.data;

      // Act
      const res = await request(app.getHttpServer()).get(`/employees/${id}`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("FindMe");
    });

    it("returns 404 for non-existent ID", async () => {
      // Act
      const res = await request(app.getHttpServer()).get(
        "/employees/00000000-0000-0000-0000-000000000000"
      );

      // Assert
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /employees/:id", () => {
    it("returns 200 with updated employee", async () => {
      // Arrange
      const createRes = await postEmployee({
        name: "Old",
        email: "old@e2e.test"
      });
      const { id } = createRes.body.data;

      // Act
      const res = await request(app.getHttpServer())
        .patch(`/employees/${id}`)
        .send({ name: "New Name" });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("New Name");
      expect(res.body.data.email).toBe("old@e2e.test");
    });

    it("returns 400 when no fields provided", async () => {
      // Arrange
      const createRes = await postEmployee({
        name: "Test",
        email: "test@e2e.test"
      });
      const { id } = createRes.body.data;

      // Act
      const res = await request(app.getHttpServer())
        .patch(`/employees/${id}`)
        .send({});

      // Assert
      expect(res.status).toBe(400);
    });

    it("returns 404 for non-existent employee", async () => {
      // Act
      const res = await request(app.getHttpServer())
        .patch("/employees/00000000-0000-0000-0000-000000000000")
        .send({ name: "Ghost" });

      // Assert
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /employees/:id", () => {
    it("returns 204 and soft-deletes the employee", async () => {
      // Arrange
      const createRes = await postEmployee({
        name: "ToDelete",
        email: "todelete@e2e.test"
      });
      const { id } = createRes.body.data;

      // Act
      const deleteRes = await request(app.getHttpServer()).delete(
        `/employees/${id}`
      );

      // Assert
      expect(deleteRes.status).toBe(204);

      const getRes = await request(app.getHttpServer()).get(`/employees/${id}`);
      expect(getRes.status).toBe(404);
    });
  });
});

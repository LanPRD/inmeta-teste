import { Test, TestingModule } from "@nestjs/testing";
import {
  FastifyAdapter,
  type NestFastifyApplication
} from "@nestjs/platform-fastify";
import request from "supertest";
import { AppModule } from "../../src/app.module";

describe("HealthController (e2e)", () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it("/health (GET)", async () => {
    const response = await request(app.getHttpServer()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
  });

  afterEach(async () => {
    await app.close();
  });
});

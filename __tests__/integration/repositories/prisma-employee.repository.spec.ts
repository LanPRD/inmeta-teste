import { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories/employee-repository";
import { PrismaModule } from "@/infra/database/prisma/prisma.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { PrismaEmployeeRepository } from "@/infra/database/repositories/prisma-employee.repository";
import { EnvModule } from "@/infra/env/env.module";
import { Test, type TestingModule } from "@nestjs/testing";
import { cleanDatabase } from "../../helpers/clean-database";

describe("PrismaEmployeeRepository (integration)", () => {
  let module: TestingModule;
  let repo: EmployeeRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [EnvModule, PrismaModule],
      providers: [
        {
          provide: EmployeeRepository,
          useClass: PrismaEmployeeRepository
        }
      ]
    }).compile();

    repo = module.get<EmployeeRepository>(EmployeeRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await module.close();
  });

  it("creates an employee and finds it by ID", async () => {
    // Arrange
    const employee = Employee.create({
      name: "John Doe",
      email: "john@integration.test"
    });

    // Act
    const created = await repo.create(employee);
    const found = await repo.findById(created.id.toString());

    // Assert
    expect(found).not.toBeNull();
    expect(found?.name).toBe("John Doe");
    expect(found?.email).toBe("john@integration.test");
  });

  it("soft deletes an employee and excludes it from findAll", async () => {
    // Arrange
    const employee = Employee.create({
      name: "Jane Doe",
      email: "jane@integration.test"
    });
    await repo.create(employee);

    // Act
    await repo.delete(employee.id.toString());

    // Assert
    const found = await repo.findById(employee.id.toString());
    expect(found).toBeNull();

    const all = await repo.findAll({ page: 1, limit: 10 });
    expect(all.data.every(e => e.email !== "jane@integration.test")).toBe(true);
  });

  it("returns distinct, non-overlapping items across pages in a stable order", async () => {
    // Arrange
    const created: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const employee = await repo.create(
        Employee.create({ name: `Ord ${i}`, email: `ord${i}@integration.test` })
      );
      created.push(employee.id.toString());
    }

    // Act
    const page1 = await repo.findAll({ page: 1, limit: 2 });
    const page2 = await repo.findAll({ page: 2, limit: 2 });
    const page3 = await repo.findAll({ page: 3, limit: 2 });

    // Assert
    const ids = [...page1.data, ...page2.data, ...page3.data].map(e =>
      e.id.toString()
    );
    expect(new Set(ids).size).toBe(5);
    expect(ids.sort()).toEqual([...created].sort());

    // Same query repeated returns the same order (stable, not random per-call)
    const page1Again = await repo.findAll({ page: 1, limit: 2 });
    expect(page1Again.data.map(e => e.id.toString())).toEqual(
      page1.data.map(e => e.id.toString())
    );
  });
});

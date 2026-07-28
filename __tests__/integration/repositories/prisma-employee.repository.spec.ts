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
});

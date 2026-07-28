import { EmployeeDocumentType } from "@/domain/entities";
import { EmployeeDocumentTypeRepository } from "@/domain/repositories/employee-document-type-repository";
import { PrismaModule } from "@/infra/database/prisma/prisma.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { PrismaEmployeeDocumentTypeRepository } from "@/infra/database/repositories/prisma-employee-document-type.repository";
import { EnvModule } from "@/infra/env/env.module";
import { Test, type TestingModule } from "@nestjs/testing";
import { cleanDatabase } from "../../helpers/clean-database";

describe("PrismaEmployeeDocumentTypeRepository (integration)", () => {
  let module: TestingModule;
  let repo: EmployeeDocumentTypeRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [EnvModule, PrismaModule],
      providers: [
        {
          provide: EmployeeDocumentTypeRepository,
          useClass: PrismaEmployeeDocumentTypeRepository
        }
      ]
    }).compile();

    repo = module.get<EmployeeDocumentTypeRepository>(
      EmployeeDocumentTypeRepository
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

  // ---- tests ----

  describe("create + findAllActive", () => {
    it("creates a link and returns it in findAllActive", async () => {
      // Arrange
      const employeeId = await createEmployee("John", "john@test.com");
      const dtId = await createDocumentType("ASO");
      const link = EmployeeDocumentType.create({
        employeeId,
        documentTypeId: dtId
      });

      // Act
      const created = await repo.create(link);
      const allActive = await repo.findAllActive();

      // Assert
      expect(created.employeeId).toBe(employeeId);
      expect(created.documentTypeId).toBe(dtId);
      expect(allActive).toHaveLength(1);
    });
  });

  describe("findActiveByEmployee", () => {
    it("returns only active links for the given employee", async () => {
      // Arrange
      const empA = await createEmployee("Alice", "alice@test.com");
      const empB = await createEmployee("Bob", "bob@test.com");
      const dt1 = await createDocumentType("ASO");
      const dt2 = await createDocumentType("NR-7");

      await repo.create(
        EmployeeDocumentType.create({ employeeId: empA, documentTypeId: dt1 })
      );
      await repo.create(
        EmployeeDocumentType.create({ employeeId: empA, documentTypeId: dt2 })
      );
      await repo.create(
        EmployeeDocumentType.create({ employeeId: empB, documentTypeId: dt1 })
      );

      // Act
      const result = await repo.findActiveByEmployee(empA);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(l => l.employeeId === empA)).toBe(true);
    });

    it("returns empty array when employee has no links", async () => {
      // Arrange
      const empId = await createEmployee("Ghost", "ghost@test.com");

      // Act
      const result = await repo.findActiveByEmployee(empId);

      // Assert
      expect(result).toEqual([]);
    });

    it("excludes unlinked items", async () => {
      // Arrange
      const empId = await createEmployee("Carl", "carl@test.com");
      const dtId = await createDocumentType("PCMSO");

      const activeLink = await repo.create(
        EmployeeDocumentType.create({ employeeId: empId, documentTypeId: dtId })
      );
      const toUnlink = await repo.create(
        EmployeeDocumentType.create({
          employeeId: empId,
          documentTypeId: await createDocumentType("NR-7")
        })
      );

      // Act — unlink
      const unlinked = EmployeeDocumentType.create(
        {
          employeeId: toUnlink.employeeId,
          documentTypeId: toUnlink.documentTypeId,
          unlinkedAt: new Date()
        },
        toUnlink.id
      );
      await repo.update(unlinked);

      const result = await repo.findActiveByEmployee(empId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id.toString()).toBe(activeLink.id.toString());
    });
  });

  describe("findByEmployeeAndDocumentType", () => {
    it("returns the specific link", async () => {
      // Arrange
      const empId = await createEmployee("Diana", "diana@test.com");
      const dtId = await createDocumentType("ASO");
      await repo.create(
        EmployeeDocumentType.create({ employeeId: empId, documentTypeId: dtId })
      );

      // Act
      const found = await repo.findByEmployeeAndDocumentType(empId, dtId);

      // Assert
      expect(found).not.toBeNull();
      expect(found?.employeeId).toBe(empId);
      expect(found?.documentTypeId).toBe(dtId);
    });

    it("returns null when no link exists for the pair", async () => {
      // Act
      const found = await repo.findByEmployeeAndDocumentType(
        "nonexistent-emp",
        "nonexistent-dt"
      );

      // Assert
      expect(found).toBeNull();
    });
  });

  describe("update", () => {
    it("sets unlinkedAt and the link disappears from findAllActive", async () => {
      // Arrange
      const empId = await createEmployee("Eve", "eve@test.com");
      const dtId = await createDocumentType("ASO");
      const link = await repo.create(
        EmployeeDocumentType.create({ employeeId: empId, documentTypeId: dtId })
      );

      // Act
      const updated = EmployeeDocumentType.create(
        { employeeId: empId, documentTypeId: dtId, unlinkedAt: new Date() },
        link.id
      );
      await repo.update(updated);

      // Assert
      const allActive = await repo.findAllActive();
      expect(allActive).toHaveLength(0);
    });
  });
});

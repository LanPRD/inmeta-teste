import { DocumentType } from "@/domain/entities";
import { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import { PrismaModule } from "@/infra/database/prisma/prisma.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { PrismaDocumentTypeRepository } from "@/infra/database/repositories/prisma-document-type.repository";
import { EnvModule } from "@/infra/env/env.module";
import { Test, type TestingModule } from "@nestjs/testing";
import { cleanDatabase } from "../../helpers/clean-database";

describe("PrismaDocumentTypeRepository (integration)", () => {
  let module: TestingModule;
  let repo: DocumentTypeRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [EnvModule, PrismaModule],
      providers: [
        {
          provide: DocumentTypeRepository,
          useClass: PrismaDocumentTypeRepository
        }
      ]
    }).compile();

    repo = module.get<DocumentTypeRepository>(DocumentTypeRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await module.close();
  });

  describe("create + findById", () => {
    it("creates a document type and finds it by ID", async () => {
      // Arrange
      const docType = DocumentType.create({
        name: "ASO",
        description: "Atestado de Saúde Ocupacional"
      });

      // Act
      const created = await repo.create(docType);
      const found = await repo.findById(created.id.toString());

      // Assert
      expect(found).not.toBeNull();
      expect(found?.name).toBe("ASO");
      expect(found?.description).toBe("Atestado de Saúde Ocupacional");
    });

    it("returns null when finding by non-existent ID", async () => {
      // Arrange
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      // Act
      const found = await repo.findById(nonExistentId);

      // Assert
      expect(found).toBeNull();
    });
  });

  describe("findByName", () => {
    it("finds a document type by exact name", async () => {
      // Arrange
      await repo.create(
        DocumentType.create({
          name: "NR-7",
          description: "Norma Regulamentadora 7"
        })
      );

      // Act
      const found = await repo.findByName("NR-7");

      // Assert
      expect(found).not.toBeNull();
      expect(found?.description).toBe("Norma Regulamentadora 7");
    });

    it("matches name case-insensitively", async () => {
      // Arrange
      await repo.create(DocumentType.create({ name: "ASO" }));

      // Act
      const found = await repo.findByName("aso");

      // Assert
      expect(found).not.toBeNull();
      expect(found?.name).toBe("ASO");
    });

    it("returns null for non-existent name", async () => {
      // Act
      const found = await repo.findByName("NONEXISTENT");

      // Assert
      expect(found).toBeNull();
    });

    it("returns null for soft-deleted document type", async () => {
      // Arrange
      const docType = DocumentType.create({ name: "TO_BE_DELETED" });
      await repo.create(docType);
      await repo.delete(docType.id.toString());

      // Act
      const found = await repo.findByName("TO_BE_DELETED");

      // Assert
      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    it("returns paginated results", async () => {
      // Arrange
      for (let i = 1; i <= 5; i++) {
        await repo.create(
          DocumentType.create({
            name: `Type ${i}`,
            description: `Description ${i}`
          })
        );
      }

      // Act
      const page1 = await repo.findAll({ page: 1, limit: 2 });

      // Assert
      expect(page1.data).toHaveLength(2);
      expect(page1.total).toBe(5);

      // Act — second page
      const page2 = await repo.findAll({ page: 2, limit: 2 });
      expect(page2.data).toHaveLength(2);

      // Act — last page
      const page3 = await repo.findAll({ page: 3, limit: 2 });
      expect(page3.data).toHaveLength(1);
    });

    it("filters by name with case-insensitive search", async () => {
      // Arrange
      await repo.create(DocumentType.create({ name: "ASO" }));
      await repo.create(DocumentType.create({ name: "NR-7" }));
      await repo.create(DocumentType.create({ name: "PCMSO" }));

      // Act
      const result = await repo.findAll({ page: 1, limit: 10, name: "aso" });

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("ASO");
      expect(result.total).toBe(1);
    });

    it("excludes soft-deleted by default", async () => {
      // Arrange
      const dt1 = await repo.create(DocumentType.create({ name: "Active" }));
      const dt2 = await repo.create(DocumentType.create({ name: "Deleted" }));
      await repo.delete(dt2.id.toString());

      // Act
      const result = await repo.findAll({ page: 1, limit: 10 });

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id.toString()).toBe(dt1.id.toString());
      expect(result.total).toBe(1);
    });

    it("includes soft-deleted when includeDeleted is true", async () => {
      // Arrange
      await repo.create(DocumentType.create({ name: "Active" }));
      const dt2 = await repo.create(DocumentType.create({ name: "Deleted" }));
      await repo.delete(dt2.id.toString());

      // Act
      const result = await repo.findAll({
        page: 1,
        limit: 10,
        includeDeleted: true
      });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe("update", () => {
    it("updates name and description", async () => {
      // Arrange
      const docType = await repo.create(
        DocumentType.create({
          name: "Old Name",
          description: "Old Description"
        })
      );

      // Act — update via a new instance with same ID (como o use-case faria)
      const updated = DocumentType.create(
        { name: "New Name", description: "New Description" },
        docType.id
      );
      await repo.update(updated);
      const found = await repo.findById(docType.id.toString());

      // Assert
      expect(found?.name).toBe("New Name");
      expect(found?.description).toBe("New Description");
    });

    it("allows clearing description", async () => {
      // Arrange
      const docType = await repo.create(
        DocumentType.create({
          name: "Has Desc",
          description: "Will be cleared"
        })
      );

      // Act
      const updated = DocumentType.create(
        { name: "Has Desc", description: undefined },
        docType.id
      );
      await repo.update(updated);
      const found = await repo.findById(docType.id.toString());

      // Assert
      expect(found?.description).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("soft deletes — findById returns null after delete", async () => {
      // Arrange
      const docType = await repo.create(
        DocumentType.create({ name: "To Delete" })
      );

      // Act
      await repo.delete(docType.id.toString());
      const found = await repo.findById(docType.id.toString());

      // Assert
      expect(found).toBeNull();
    });
  });
});

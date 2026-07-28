import { GetAllDocumentTypesUseCase } from "@/application/use-cases/document-types";
import { InternalError, ValidationError } from "@/core/errors";
import { DocumentType } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryDocumentTypeRepository } from "../../../test-repositories/in-memory-document-type-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryDocumentTypeRepository();
  const sut = new GetAllDocumentTypesUseCase(repo);

  return { sut, repo };
};

describe("GetAllDocumentTypesUseCase", () => {
  describe("execute", () => {
    it("returns paginated document types", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      await repo.create(DocumentType.create({ name: "ASO" }));
      await repo.create(DocumentType.create({ name: "CPF" }));
      await repo.create(DocumentType.create({ name: "Certidão" }));

      // Act
      const result = await sut.execute({ page: 1, limit: 2 });

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.documentTypes).toHaveLength(2);
        expect(result.value.meta).toEqual({ page: 1, limit: 2, total: 3 });
      }
    });

    it("filters document types by name", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      await repo.create(DocumentType.create({ name: "ASO" }));
      await repo.create(DocumentType.create({ name: "Certidão" }));

      // Act
      const result = await sut.execute({ page: 1, limit: 10, name: "aso" });

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.documentTypes).toHaveLength(1);
        expect(result.value.documentTypes[0].name).toBe("ASO");
      }
    });

    it("returns ValidationError when query params are invalid", async () => {
      // Arrange
      const { sut } = makeSut();

      // Act
      const result = await sut.execute({ page: 0, limit: 10 });

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ValidationError);
      }
    });

    it("returns InternalError when repository throws", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      repo.forceError = true;

      // Act
      const result = await sut.execute({ page: 1, limit: 10 });

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

import { CreateDocumentTypeUseCase } from "@/application/use-cases/document-types";
import { ConflictError, InternalError, ValidationError } from "@/core/errors";
import { DocumentType } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryDocumentTypeRepository } from "../../../test-repositories/in-memory-document-type-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryDocumentTypeRepository();
  const sut = new CreateDocumentTypeUseCase(repo);

  return { sut, repo };
};

describe("CreateDocumentTypeUseCase", () => {
  describe("execute", () => {
    it("creates a document type and returns it on success", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const input = {
        name: "ASO",
        description: "Atestado de Saúde Ocupacional"
      };

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.documentType.name).toBe("ASO");
        expect(result.value.documentType.description).toBe(
          "Atestado de Saúde Ocupacional"
        );
      }

      const persisted = await repo.findByName("ASO");
      expect(persisted).not.toBeNull();
    });

    it("creates a document type without description", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const input = { name: "CPF" };

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.documentType.name).toBe("CPF");
        expect(result.value.documentType.description).toBeUndefined();
      }
    });

    it("returns ValidationError when name is empty", async () => {
      // Arrange
      const { sut } = makeSut();
      const input = { name: "" };

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ValidationError);
      }
    });

    it("returns ConflictError when name already exists", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const existing = DocumentType.create({ name: "ASO" });
      await repo.create(existing);
      const input = { name: "ASO" };

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ConflictError);
      }
    });

    it("returns InternalError when repository throws", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      repo.forceError = true;
      const input = { name: "ASO" };

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

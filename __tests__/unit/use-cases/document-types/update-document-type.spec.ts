import { UpdateDocumentTypeUseCase } from "@/application/use-cases/document-types";
import {
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError
} from "@/core/errors";
import { DocumentType } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryDocumentTypeRepository } from "../../../test-repositories/in-memory-document-type-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryDocumentTypeRepository();
  const sut = new UpdateDocumentTypeUseCase(repo);

  return { sut, repo };
};

describe("UpdateDocumentTypeUseCase", () => {
  describe("execute", () => {
    it("updates document type name", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const documentType = DocumentType.create({ name: "ASO" });
      await repo.create(documentType);
      const input = { name: "ASO Atualizado" };

      // Act
      const result = await sut.execute(documentType.id.toString(), input);

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.documentType.name).toBe("ASO Atualizado");
      }
    });

    it("updates document type description", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const documentType = DocumentType.create({
        name: "ASO",
        description: "Antiga"
      });
      await repo.create(documentType);
      const input = { description: "Nova descrição" };

      // Act
      const result = await sut.execute(documentType.id.toString(), input);

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.documentType.description).toBe("Nova descrição");
        expect(result.value.documentType.name).toBe("ASO");
      }
    });

    it("returns ValidationError when body is empty", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const documentType = DocumentType.create({ name: "ASO" });
      await repo.create(documentType);

      // Act
      const result = await sut.execute(documentType.id.toString(), {});

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ValidationError);
      }
    });

    it("returns NotFoundError when document type does not exist", async () => {
      // Arrange
      const { sut } = makeSut();
      const input = { name: "Novo" };

      // Act
      const result = await sut.execute("non-existent-id", input);

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(NotFoundError);
      }
    });

    it("returns ConflictError when name belongs to another document type", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const dt1 = DocumentType.create({ name: "ASO" });
      const dt2 = DocumentType.create({ name: "CPF" });
      await repo.create(dt1);
      await repo.create(dt2);
      const input = { name: "CPF" };

      // Act
      const result = await sut.execute(dt1.id.toString(), input);

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ConflictError);
      }
    });

    it("returns InternalError when repository throws", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const documentType = DocumentType.create({ name: "ASO" });
      await repo.create(documentType);
      repo.forceError = true;
      const input = { name: "Novo" };

      // Act
      const result = await sut.execute(documentType.id.toString(), input);

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

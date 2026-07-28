import { DeleteDocumentTypeUseCase } from "@/application/use-cases/document-types";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import { DocumentType } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryDocumentTypeRepository } from "../../../test-repositories/in-memory-document-type-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryDocumentTypeRepository();
  const sut = new DeleteDocumentTypeUseCase(repo);

  return { sut, repo };
};

describe("DeleteDocumentTypeUseCase", () => {
  describe("execute", () => {
    it("soft deletes an existing document type", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const documentType = DocumentType.create({ name: "ASO" });
      await repo.create(documentType);

      // Act
      const result = await sut.execute(documentType.id.toString());

      // Assert
      expect(result.isRight()).toBe(true);

      const deleted = await repo.findById(documentType.id.toString());
      expect(deleted).toBeNull();
    });

    it("returns ValidationError when ID is empty", async () => {
      // Arrange
      const { sut } = makeSut();

      // Act
      const result = await sut.execute("");

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ValidationError);
      }
    });

    it("returns NotFoundError when document type does not exist", async () => {
      // Arrange
      const { sut } = makeSut();

      // Act
      const result = await sut.execute("non-existent-id");

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(NotFoundError);
      }
    });

    it("returns InternalError when repository throws", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const documentType = DocumentType.create({ name: "ASO" });
      await repo.create(documentType);
      repo.forceError = true;

      // Act
      const result = await sut.execute(documentType.id.toString());

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

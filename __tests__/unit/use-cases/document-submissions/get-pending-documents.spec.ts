import { GetPendingDocumentsUseCase } from "@/application/use-cases/document-submissions";
import { InternalError, ValidationError } from "@/core/errors";
import { Logger } from "@nestjs/common";
import { InMemoryDocumentSubmissionRepository } from "../../../test-repositories/in-memory-document-submission-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const submissionRepo = new InMemoryDocumentSubmissionRepository();
  const sut = new GetPendingDocumentsUseCase(submissionRepo);

  return { sut, submissionRepo };
};

describe("GetPendingDocumentsUseCase", () => {
  describe("execute", () => {
    it("returns paginated pending documents", async () => {
      // Arrange
      const { sut, submissionRepo } = makeSut();
      submissionRepo.pendingItems = [
        {
          employeeId: "emp-1",
          employeeName: "John",
          documentTypeId: "dt-1",
          documentTypeName: "ASO",
          linkedAt: new Date()
        },
        {
          employeeId: "emp-2",
          employeeName: "Jane",
          documentTypeId: "dt-1",
          documentTypeName: "ASO",
          linkedAt: new Date()
        }
      ];

      // Act
      const result = await sut.execute({ page: 1, limit: 1 });

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.pending).toHaveLength(1);
        expect(result.value.meta).toEqual({ page: 1, limit: 1, total: 2 });
      }
    });

    it("returns empty list when no pending documents", async () => {
      // Arrange
      const { sut, submissionRepo } = makeSut();
      submissionRepo.pendingItems = [];

      // Act
      const result = await sut.execute({ page: 1, limit: 10 });

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.pending).toHaveLength(0);
        expect(result.value.meta.total).toBe(0);
      }
    });

    it("returns ValidationError when params are invalid", async () => {
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
      const { sut, submissionRepo } = makeSut();
      submissionRepo.forceError = true;

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

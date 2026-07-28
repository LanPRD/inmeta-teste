import { GetStatsUseCase } from "@/application/use-cases/document-submissions";
import { InternalError } from "@/core/errors";
import { Logger } from "@nestjs/common";
import { InMemoryDocumentSubmissionRepository } from "../../../test-repositories/in-memory-document-submission-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const submissionRepo = new InMemoryDocumentSubmissionRepository();
  const sut = new GetStatsUseCase(submissionRepo);

  return { sut, submissionRepo };
};

describe("GetStatsUseCase", () => {
  describe("execute", () => {
    it("returns completion stats with percentage", async () => {
      // Arrange
      const { sut, submissionRepo } = makeSut();
      submissionRepo.statsData = {
        totalRequired: 10,
        totalFulfilled: 7,
        mostPending: [
          {
            documentTypeId: "dt-1",
            documentTypeName: "ASO",
            pendingCount: 3
          }
        ],
        recentSubmissions: [
          {
            employeeId: "emp-1",
            employeeName: "John",
            documentTypeId: "dt-1",
            documentTypeName: "ASO",
            version: 1,
            submittedAt: new Date()
          }
        ]
      };

      // Act
      const result = await sut.execute();

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.completion.totalRequired).toBe(10);
        expect(result.value.completion.totalFulfilled).toBe(7);
        expect(result.value.completion.percentage).toBe(70);
        expect(result.value.mostPendingDocumentTypes).toHaveLength(1);
        expect(result.value.recentSubmissions).toHaveLength(1);
      }
    });

    it("returns zero percentage when totalRequired is zero", async () => {
      // Arrange
      const { sut, submissionRepo } = makeSut();
      submissionRepo.statsData = {
        totalRequired: 0,
        totalFulfilled: 0,
        mostPending: [],
        recentSubmissions: []
      };

      // Act
      const result = await sut.execute();

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.completion.percentage).toBe(0);
      }
    });

    it("returns InternalError when repository throws", async () => {
      // Arrange
      const { sut, submissionRepo } = makeSut();
      submissionRepo.forceError = true;

      // Act
      const result = await sut.execute();

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

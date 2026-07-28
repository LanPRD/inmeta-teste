import { GetActiveSubmissionsUseCase } from "@/application/use-cases/document-submissions";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import { DocumentSubmission, Employee } from "@/domain/entities";
import { SubmissionStatus } from "@/domain/enums";
import { Logger } from "@nestjs/common";
import { InMemoryDocumentSubmissionRepository } from "../../../test-repositories/in-memory-document-submission-repository";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const employeeRepo = new InMemoryEmployeeRepository();
  const submissionRepo = new InMemoryDocumentSubmissionRepository();
  const sut = new GetActiveSubmissionsUseCase(employeeRepo, submissionRepo);

  return { sut, employeeRepo, submissionRepo };
};

describe("GetActiveSubmissionsUseCase", () => {
  describe("execute", () => {
    it("returns all active submissions for an employee", async () => {
      // Arrange
      const { sut, employeeRepo, submissionRepo } = makeSut();
      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      await employeeRepo.create(employee);

      await submissionRepo.create(
        DocumentSubmission.create({
          employeeId: employee.id.toString(),
          documentTypeId: "dt-1",
          version: 1,
          status: SubmissionStatus.ACTIVE
        })
      );
      await submissionRepo.create(
        DocumentSubmission.create({
          employeeId: employee.id.toString(),
          documentTypeId: "dt-2",
          version: 1,
          status: SubmissionStatus.ACTIVE
        })
      );

      // Act
      const result = await sut.execute(employee.id.toString());

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.submissions).toHaveLength(2);
      }
    });

    it("filters by documentTypeId when provided", async () => {
      // Arrange
      const { sut, employeeRepo, submissionRepo } = makeSut();
      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      await employeeRepo.create(employee);

      await submissionRepo.create(
        DocumentSubmission.create({
          employeeId: employee.id.toString(),
          documentTypeId: "dt-1",
          version: 1,
          status: SubmissionStatus.ACTIVE
        })
      );
      await submissionRepo.create(
        DocumentSubmission.create({
          employeeId: employee.id.toString(),
          documentTypeId: "dt-2",
          version: 1,
          status: SubmissionStatus.ACTIVE
        })
      );

      // Act
      const result = await sut.execute(employee.id.toString(), "dt-1");

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.submissions).toHaveLength(1);
        expect(result.value.submissions[0].documentTypeId).toBe("dt-1");
      }
    });

    it("returns ValidationError when employeeId is empty", async () => {
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

    it("returns NotFoundError when employee does not exist", async () => {
      // Arrange
      const { sut } = makeSut();

      // Act
      const result = await sut.execute("non-existent");

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(NotFoundError);
      }
    });

    it("returns InternalError when repository throws", async () => {
      // Arrange
      const { sut, employeeRepo } = makeSut();
      employeeRepo.forceError = true;

      // Act
      const result = await sut.execute("emp-1");

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

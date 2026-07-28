import { GetSubmissionHistoryUseCase } from "@/application/use-cases/document-submissions";
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
  const sut = new GetSubmissionHistoryUseCase(employeeRepo, submissionRepo);

  return { sut, employeeRepo, submissionRepo };
};

describe("GetSubmissionHistoryUseCase", () => {
  describe("execute", () => {
    it("returns all versions ordered by version desc", async () => {
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
          status: SubmissionStatus.SUPERSEDED
        })
      );
      await submissionRepo.create(
        DocumentSubmission.create({
          employeeId: employee.id.toString(),
          documentTypeId: "dt-1",
          version: 2,
          status: SubmissionStatus.ACTIVE
        })
      );

      // Act
      const result = await sut.execute(employee.id.toString(), "dt-1");

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.submissions).toHaveLength(2);
        expect(result.value.submissions[0].version).toBe(2);
        expect(result.value.submissions[1].version).toBe(1);
      }
    });

    it("returns ValidationError when params are empty", async () => {
      // Arrange
      const { sut } = makeSut();

      // Act
      const result = await sut.execute("", "");

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
      const result = await sut.execute("non-existent", "dt-1");

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
      const result = await sut.execute("emp-1", "dt-1");

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });

    it("returns history even when the employee is soft-deleted", async () => {
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
      await employeeRepo.delete(employee.id.toString());

      // Act
      const result = await sut.execute(employee.id.toString(), "dt-1");

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.submissions).toHaveLength(1);
      }
    });

    it("excludes soft-deleted versions by default and includes them when requested", async () => {
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
          status: SubmissionStatus.SUPERSEDED,
          deletedAt: new Date()
        })
      );

      // Act
      const withoutDeleted = await sut.execute(employee.id.toString(), "dt-1");
      const withDeleted = await sut.execute(
        employee.id.toString(),
        "dt-1",
        true
      );

      // Assert
      expect(
        withoutDeleted.isRight() && withoutDeleted.value.submissions
      ).toEqual([]);
      expect(
        withDeleted.isRight() && withDeleted.value.submissions
      ).toHaveLength(1);
    });
  });
});

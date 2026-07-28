import { SubmitDocumentUseCase } from "@/application/use-cases/document-submissions";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import {
  DocumentType,
  Employee,
  EmployeeDocumentType
} from "@/domain/entities";
import { SubmissionStatus } from "@/domain/enums";
import { Logger } from "@nestjs/common";
import { InMemoryDocumentSubmissionRepository } from "../../../test-repositories/in-memory-document-submission-repository";
import { InMemoryDocumentTypeRepository } from "../../../test-repositories/in-memory-document-type-repository";
import { InMemoryEmployeeDocumentTypeRepository } from "../../../test-repositories/in-memory-employee-document-type-repository";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const employeeRepo = new InMemoryEmployeeRepository();
  const documentTypeRepo = new InMemoryDocumentTypeRepository();
  const linkRepo = new InMemoryEmployeeDocumentTypeRepository();
  const submissionRepo = new InMemoryDocumentSubmissionRepository();
  const sut = new SubmitDocumentUseCase(
    employeeRepo,
    documentTypeRepo,
    linkRepo,
    submissionRepo
  );

  return { sut, employeeRepo, documentTypeRepo, linkRepo, submissionRepo };
};

const setupLinkedEmployee = async (
  employeeRepo: InMemoryEmployeeRepository,
  documentTypeRepo: InMemoryDocumentTypeRepository,
  linkRepo: InMemoryEmployeeDocumentTypeRepository
) => {
  const employee = Employee.create({ name: "John", email: "john@test.com" });
  const documentType = DocumentType.create({ name: "ASO" });
  await employeeRepo.create(employee);
  await documentTypeRepo.create(documentType);
  await linkRepo.create(
    EmployeeDocumentType.create({
      employeeId: employee.id.toString(),
      documentTypeId: documentType.id.toString()
    })
  );

  return { employee, documentType };
};

describe("SubmitDocumentUseCase", () => {
  describe("execute", () => {
    it("creates version 1 when no active version exists", async () => {
      // Arrange
      const { sut, employeeRepo, documentTypeRepo, linkRepo } = makeSut();
      const { employee, documentType } = await setupLinkedEmployee(
        employeeRepo,
        documentTypeRepo,
        linkRepo
      );
      const input = { documentTypeId: documentType.id.toString() };

      // Act
      const result = await sut.execute(employee.id.toString(), input);

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.submission.version).toBe(1);
        expect(result.value.submission.status).toBe(SubmissionStatus.ACTIVE);
        expect(result.value.submission.employeeId).toBe(employee.id.toString());
        expect(result.value.submission.documentTypeId).toBe(
          documentType.id.toString()
        );
      }
    });

    it("supersedes previous version and creates new one", async () => {
      // Arrange
      const { sut, employeeRepo, documentTypeRepo, linkRepo, submissionRepo } =
        makeSut();
      const { employee, documentType } = await setupLinkedEmployee(
        employeeRepo,
        documentTypeRepo,
        linkRepo
      );
      const input = { documentTypeId: documentType.id.toString() };

      // First submission
      await sut.execute(employee.id.toString(), input);

      // Act — second submission
      const result = await sut.execute(employee.id.toString(), input);

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.submission.version).toBe(2);
        expect(result.value.submission.status).toBe(SubmissionStatus.ACTIVE);
      }

      // Verify previous is now superseded
      const history = await submissionRepo.findHistory(
        employee.id.toString(),
        documentType.id.toString()
      );
      expect(history).toHaveLength(2);
      expect(history[0].version).toBe(2);
      expect(history[0].status).toBe(SubmissionStatus.ACTIVE);
      expect(history[1].version).toBe(1);
      expect(history[1].status).toBe(SubmissionStatus.SUPERSEDED);
    });

    it("returns ValidationError when documentTypeId is empty", async () => {
      // Arrange
      const { sut } = makeSut();
      const input = { documentTypeId: "" };

      // Act
      const result = await sut.execute("emp-1", input);

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ValidationError);
      }
    });

    it("returns NotFoundError when employee does not exist", async () => {
      // Arrange
      const { sut } = makeSut();
      const input = { documentTypeId: "dt-1" };

      // Act
      const result = await sut.execute("non-existent", input);

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(NotFoundError);
      }
    });

    it("returns NotFoundError when document type does not exist", async () => {
      // Arrange
      const { sut, employeeRepo } = makeSut();
      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      await employeeRepo.create(employee);
      const input = { documentTypeId: "non-existent" };

      // Act
      const result = await sut.execute(employee.id.toString(), input);

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(NotFoundError);
      }
    });

    it("returns NotFoundError when document type is not linked to the employee", async () => {
      // Arrange
      const { sut, employeeRepo, documentTypeRepo } = makeSut();
      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      const documentType = DocumentType.create({ name: "ASO" });
      await employeeRepo.create(employee);
      await documentTypeRepo.create(documentType);
      const input = { documentTypeId: documentType.id.toString() };

      // Act
      const result = await sut.execute(employee.id.toString(), input);

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
      const input = { documentTypeId: "dt-1" };

      // Act
      const result = await sut.execute("emp-1", input);

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

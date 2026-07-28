import { LinkDocumentTypeUseCase } from "@/application/use-cases/employee-document-types";
import { ConflictError, InternalError, NotFoundError } from "@/core/errors";
import { DocumentType, Employee } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryDocumentTypeRepository } from "../../../test-repositories/in-memory-document-type-repository";
import { InMemoryEmployeeDocumentTypeRepository } from "../../../test-repositories/in-memory-employee-document-type-repository";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const employeeRepo = new InMemoryEmployeeRepository();
  const documentTypeRepo = new InMemoryDocumentTypeRepository();
  const linkRepo = new InMemoryEmployeeDocumentTypeRepository();
  const sut = new LinkDocumentTypeUseCase(
    employeeRepo,
    documentTypeRepo,
    linkRepo
  );

  return { sut, employeeRepo, documentTypeRepo, linkRepo };
};

describe("LinkDocumentTypeUseCase", () => {
  describe("execute", () => {
    it("links a document type to an employee", async () => {
      // Arrange
      const { sut, employeeRepo, documentTypeRepo } = makeSut();
      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      const dt = DocumentType.create({ name: "ASO" });
      await employeeRepo.create(employee);
      await documentTypeRepo.create(dt);

      // Act
      const result = await sut.execute(
        employee.id.toString(),
        dt.id.toString()
      );

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.link.employeeId).toBe(employee.id.toString());
        expect(result.value.link.documentTypeId).toBe(dt.id.toString());
        expect(result.value.link.unlinkedAt).toBeNull();
      }
    });

    it("returns NotFoundError when employee does not exist", async () => {
      // Arrange
      const { sut } = makeSut();

      // Act
      const result = await sut.execute("non-existent", "some-id");

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

      // Act
      const result = await sut.execute(employee.id.toString(), "non-existent");

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(NotFoundError);
      }
    });

    it("returns ConflictError when already linked", async () => {
      // Arrange
      const { sut, employeeRepo, documentTypeRepo, linkRepo } = makeSut();
      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      const dt = DocumentType.create({ name: "ASO" });
      await employeeRepo.create(employee);
      await documentTypeRepo.create(dt);

      // Link first time
      await sut.execute(employee.id.toString(), dt.id.toString());

      // Act — link again
      const result = await sut.execute(
        employee.id.toString(),
        dt.id.toString()
      );

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ConflictError);
      }
    });

    it("returns InternalError when repository throws", async () => {
      // Arrange
      const { sut, employeeRepo } = makeSut();
      employeeRepo.forceError = true;

      // Act
      const result = await sut.execute("some-id", "some-id");

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

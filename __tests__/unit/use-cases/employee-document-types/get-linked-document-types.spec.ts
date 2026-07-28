import { GetLinkedDocumentTypesUseCase } from "@/application/use-cases/employee-document-types";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import { Employee, EmployeeDocumentType } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryEmployeeDocumentTypeRepository } from "../../../test-repositories/in-memory-employee-document-type-repository";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const employeeRepo = new InMemoryEmployeeRepository();
  const linkRepo = new InMemoryEmployeeDocumentTypeRepository();
  const sut = new GetLinkedDocumentTypesUseCase(employeeRepo, linkRepo);

  return { sut, employeeRepo, linkRepo };
};

describe("GetLinkedDocumentTypesUseCase", () => {
  describe("execute", () => {
    it("returns only active links for an employee", async () => {
      // Arrange
      const { sut, employeeRepo, linkRepo } = makeSut();
      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      await employeeRepo.create(employee);

      const active = EmployeeDocumentType.create({
        employeeId: employee.id.toString(),
        documentTypeId: "dt-1"
      });
      const unlinked = EmployeeDocumentType.create({
        employeeId: employee.id.toString(),
        documentTypeId: "dt-2",
        unlinkedAt: new Date()
      });
      await linkRepo.create(active);
      await linkRepo.create(unlinked);

      // Act
      const result = await sut.execute(employee.id.toString());

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.links).toHaveLength(1);
        expect(result.value.links[0].documentTypeId).toBe("dt-1");
      }
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
      const result = await sut.execute("some-id");

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

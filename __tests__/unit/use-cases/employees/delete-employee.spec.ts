import { DeleteEmployeeUseCase } from "@/application/use-cases/employees";
import { InternalError, NotFoundError, ValidationError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryEmployeeRepository();
  const sut = new DeleteEmployeeUseCase(repo);

  return { sut, repo };
};

describe("DeleteEmployeeUseCase", () => {
  describe("execute", () => {
    it("soft deletes an existing employee", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      await repo.create(employee);

      // Act
      const result = await sut.execute(employee.id.toString());

      // Assert
      expect(result.isRight()).toBe(true);

      // Verify soft delete: findById returns null after deletion
      const deleted = await repo.findById(employee.id.toString());
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

    it("returns NotFoundError when employee does not exist", async () => {
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
      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      await repo.create(employee);
      repo.forceError = true;

      // Act
      const result = await sut.execute(employee.id.toString());

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

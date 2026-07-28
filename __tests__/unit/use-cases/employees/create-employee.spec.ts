import { CreateEmployeeUseCase } from "@/application/use-cases/employees";
import { ConflictError, InternalError, ValidationError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryEmployeeRepository();
  const sut = new CreateEmployeeUseCase(repo);

  return { sut, repo };
};

describe("CreateEmployeeUseCase", () => {
  describe("execute", () => {
    it("creates employee and returns it on success", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const input = { name: "John Doe", email: "john@example.com" };

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.employee.name).toBe("John Doe");
        expect(result.value.employee.email).toBe("john@example.com");
      }

      // Also assert the employee is persisted
      const persisted = await repo.findByEmail("john@example.com");

      expect(persisted).not.toBeNull();
    });

    it("returns ValidationError when email is invalid", async () => {
      // Arrange
      const { sut } = makeSut();
      const input = { name: "John Doe", email: "not-an-email" };

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ValidationError);
      }
    });

    it("returns ConflictError when email already exists", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const input = { name: "John Doe", email: "john@example.com" };

      const existing = Employee.create({
        name: "Jane",
        email: "john@example.com"
      });

      await repo.create(existing);

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ConflictError);
      }
    });

    it("returns InternalError when repository throws", async () => {
      // Arrange
      const { sut, repo } = makeSut();
      const input = { name: "John Doe", email: "john@example.com" };
      repo.forceError = true;

      // Act
      const result = await sut.execute(input);

      // Assert
      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

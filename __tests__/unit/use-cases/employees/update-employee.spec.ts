import { UpdateEmployeeUseCase } from "@/application/use-cases/employees";
import {
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError
} from "@/core/errors";
import { Employee } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryEmployeeRepository();
  const sut = new UpdateEmployeeUseCase(repo);

  return { sut, repo };
};

describe("UpdateEmployeeUseCase", () => {
  describe("execute", () => {
    it("updates employee name and returns the updated entity", async () => {
      // Arrange
      const { sut, repo } = makeSut();

      const employee = Employee.create({
        name: "Old Name",
        email: "old@test.com"
      });
      await repo.create(employee);

      const input = { name: "New Name" };

      // Act
      const result = await sut.execute(employee.id.toString(), input);

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.employee.name).toBe("New Name");
        expect(result.value.employee.email).toBe("old@test.com");
      }
    });

    it("updates employee email and checks for conflicts", async () => {
      // Arrange
      const { sut, repo } = makeSut();

      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      await repo.create(employee);

      const input = { email: "john.new@test.com" };

      // Act
      const result = await sut.execute(employee.id.toString(), input);

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.employee.email).toBe("john.new@test.com");
      }
    });

    it("returns ValidationError when body is empty", async () => {
      // Arrange
      const { sut, repo } = makeSut();

      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      await repo.create(employee);

      // Act
      const result = await sut.execute(employee.id.toString(), {});

      // Assert
      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ValidationError);
      }
    });

    it("returns NotFoundError when employee does not exist", async () => {
      // Arrange
      const { sut } = makeSut();
      const input = { name: "New Name" };

      // Act
      const result = await sut.execute("non-existent-id", input);

      // Assert
      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(NotFoundError);
      }
    });

    it("returns ConflictError when email belongs to another employee", async () => {
      // Arrange
      const { sut, repo } = makeSut();

      const employee = Employee.create({
        name: "John",
        email: "john@test.com"
      });
      const other = Employee.create({ name: "Jane", email: "jane@test.com" });

      await repo.create(employee);
      await repo.create(other);

      const input = { email: "jane@test.com" };

      // Act
      const result = await sut.execute(employee.id.toString(), input);

      // Assert
      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(ConflictError);
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

      const input = { name: "New Name" };

      // Act
      const result = await sut.execute(employee.id.toString(), input);

      // Assert
      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

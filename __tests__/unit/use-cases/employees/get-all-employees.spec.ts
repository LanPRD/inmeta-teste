import { GetAllEmployeesUseCase } from "@/application/use-cases/employees";
import { InternalError, ValidationError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryEmployeeRepository } from "../../../test-repositories/in-memory-employee-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const repo = new InMemoryEmployeeRepository();
  const sut = new GetAllEmployeesUseCase(repo);

  return { sut, repo };
};

describe("GetAllEmployeesUseCase", () => {
  describe("execute", () => {
    it("returns paginated employees", async () => {
      // Arrange
      const { sut, repo } = makeSut();

      await repo.create(Employee.create({ name: "A", email: "a@test.com" }));
      await repo.create(Employee.create({ name: "B", email: "b@test.com" }));
      await repo.create(Employee.create({ name: "C", email: "c@test.com" }));

      // Act
      const result = await sut.execute({ page: 1, limit: 2 });

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.employees).toHaveLength(2);
        expect(result.value.meta).toEqual({ page: 1, limit: 2, total: 3 });
      }
    });

    it("filters employees by name", async () => {
      // Arrange
      const { sut, repo } = makeSut();

      await repo.create(
        Employee.create({ name: "Alice", email: "alice@test.com" })
      );

      await repo.create(
        Employee.create({ name: "Bob", email: "bob@test.com" })
      );

      await repo.create(
        Employee.create({ name: "Charlie", email: "charlie@test.com" })
      );

      // Act
      const result = await sut.execute({ page: 1, limit: 10, name: "ali" });

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.employees).toHaveLength(1);
        expect(result.value.employees[0].name).toBe("Alice");
      }
    });

    it("returns ValidationError when query params are invalid", async () => {
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
      const { sut, repo } = makeSut();
      repo.forceError = true;

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

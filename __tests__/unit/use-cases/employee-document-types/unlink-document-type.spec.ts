import { UnlinkDocumentTypeUseCase } from "@/application/use-cases/employee-document-types";
import { InternalError, NotFoundError } from "@/core/errors";
import { EmployeeDocumentType } from "@/domain/entities";
import { Logger } from "@nestjs/common";
import { InMemoryEmployeeDocumentTypeRepository } from "../../../test-repositories/in-memory-employee-document-type-repository";

vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});

const makeSut = () => {
  const linkRepo = new InMemoryEmployeeDocumentTypeRepository();
  const sut = new UnlinkDocumentTypeUseCase(linkRepo);

  return { sut, linkRepo };
};

describe("UnlinkDocumentTypeUseCase", () => {
  describe("execute", () => {
    it("unlinks a document type from an employee", async () => {
      // Arrange
      const { sut, linkRepo } = makeSut();
      const link = EmployeeDocumentType.create({
        employeeId: "emp-1",
        documentTypeId: "dt-1"
      });
      await linkRepo.create(link);

      // Act
      const result = await sut.execute("emp-1", "dt-1");

      // Assert
      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value.link.unlinkedAt).not.toBeNull();
      }

      // Verify the link is updated in the repo
      const updated = await linkRepo.findByEmployeeAndDocumentType(
        "emp-1",
        "dt-1"
      );
      expect(updated?.unlinkedAt).not.toBeNull();
    });

    it("returns NotFoundError when link does not exist", async () => {
      // Arrange
      const { sut } = makeSut();

      // Act
      const result = await sut.execute("emp-1", "dt-1");

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(NotFoundError);
      }
    });

    it("returns InternalError when repository throws", async () => {
      // Arrange
      const { sut, linkRepo } = makeSut();
      linkRepo.forceError = true;

      // Act
      const result = await sut.execute("emp-1", "dt-1");

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});

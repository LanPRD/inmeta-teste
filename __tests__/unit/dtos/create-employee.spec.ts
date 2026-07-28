import { CreateEmployeeSchema } from "@/application/dtos";

describe("CreateEmployeeSchema", () => {
  it("parses valid input", () => {
    // Arrange
    const input = { name: "John Doe", email: "John@Example.com" };

    // Act
    const result = CreateEmployeeSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("John Doe");
      expect(result.data.email).toBe("john@example.com");
    }
  });

  it("rejects empty name", () => {
    // Arrange
    const input = { name: "", email: "john@example.com" };

    // Act
    const result = CreateEmployeeSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);

    if (!result.success) {
      const nameIssue = result.error.issues.find(i => i.path[0] === "name");
      expect(nameIssue).toBeDefined();
    }
  });

  it("rejects invalid email", () => {
    // Arrange
    const input = { name: "John Doe", email: "not-an-email" };

    // Act
    const result = CreateEmployeeSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);

    if (!result.success) {
      const emailIssue = result.error.issues.find(i => i.path[0] === "email");
      expect(emailIssue).toBeDefined();
    }
  });

  it("trims whitespace from name and email", () => {
    // Arrange
    const input = { name: "  John Doe  ", email: "  John@Example.com  " };

    // Act
    const result = CreateEmployeeSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("John Doe");
      expect(result.data.email).toBe("john@example.com");
    }
  });
});

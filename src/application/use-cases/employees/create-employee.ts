import {
  CreateEmployeeSchema,
  type CreateEmployeeDto
} from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { ConflictError, InternalError, ValidationError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";
import { Injectable, Logger } from "@nestjs/common";

type CreateEmployeeUseCaseResponse = Either<
  ConflictError | ValidationError | InternalError,
  { employee: Employee }
>;

@Injectable()
export class CreateEmployeeUseCase {
  private readonly logger = new Logger(CreateEmployeeUseCase.name);

  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(
    input: CreateEmployeeDto
  ): Promise<CreateEmployeeUseCaseResponse> {
    try {
      const parsed = CreateEmployeeSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid employee data"));
      }

      const { name, email } = parsed.data;

      const employeeAlreadyExists =
        await this.employeeRepository.findByEmail(email);

      if (employeeAlreadyExists) {
        return left(
          new ConflictError("Employee with this email already exists")
        );
      }

      const employee = Employee.create({ name, email });
      const response = await this.employeeRepository.create(employee);

      return right({ employee: response });
    } catch (error) {
      this.logger.error("Error creating employee", error);
      return left(new InternalError("Error creating employee"));
    }
  }
}

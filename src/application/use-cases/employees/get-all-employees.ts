import {
  GetAllEmployeesSchema,
  type GetAllEmployeesDto
} from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { InternalError, ValidationError } from "@/core/errors";
import type { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";
import { Injectable, Logger } from "@nestjs/common";

type GetAllEmployeesUseCaseResponse = Either<
  ValidationError | InternalError,
  {
    employees: Employee[];
    meta: { page: number; limit: number; total: number };
  }
>;

@Injectable()
export class GetAllEmployeesUseCase {
  private readonly logger = new Logger(GetAllEmployeesUseCase.name);

  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(
    input: GetAllEmployeesDto
  ): Promise<GetAllEmployeesUseCaseResponse> {
    try {
      const parsed = GetAllEmployeesSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid query parameters"));
      }

      const { page, limit, name } = parsed.data;

      const { data, total } = await this.employeeRepository.findAll({
        page,
        limit,
        name
      });

      return right({
        employees: data,
        meta: { page, limit, total }
      });
    } catch (error) {
      this.logger.error("Failed to fetch employees", error);
      return left(new InternalError("Failed to fetch employees"));
    }
  }
}

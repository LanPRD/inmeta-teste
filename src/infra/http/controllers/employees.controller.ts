import {
  CreateEmployeeSchema,
  type CreateEmployeeDto
} from "@/application/dtos";
import {
  CreateEmployeeUseCase,
  GetEmployeeByIdUseCase
} from "@/application/use-cases/employees";
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { EmployeePresenter } from "../presenters/employee-presenter";
import { ApiResponse } from "../response";

@Controller("employees")
export class EmployeesController {
  constructor(
    private readonly createEmployee: CreateEmployeeUseCase,
    private readonly getEmployeeById: GetEmployeeByIdUseCase
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateEmployeeSchema)) input: CreateEmployeeDto
  ) {
    const result = await this.createEmployee.execute(input);

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(EmployeePresenter.toHTTP(result.value.employee));
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const result = await this.getEmployeeById.execute(id);

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(EmployeePresenter.toHTTP(result.value.employee));
  }
}

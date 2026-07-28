import {
  CreateEmployeeSchema,
  type CreateEmployeeDto
} from "@/application/dtos";
import { CreateEmployeeUseCase } from "@/application/use-cases/employees";
import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { CreateEmployeeSwaggerDto } from "../../docs/create-employee.swagger.dto";
import { EmployeeResponseSwaggerDto } from "../../docs/employee-response.swagger.dto";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { EmployeePresenter } from "../../presenters/employee-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Employees")
@Controller("employees")
export class CreateEmployeeController {
  constructor(private readonly createEmployee: CreateEmployeeUseCase) {}

  @Post()
  @ApiOperation({ summary: "Cria um colaborador" })
  @ApiBody({ type: CreateEmployeeSwaggerDto })
  @ApiCreatedResponse({
    description: "Colaborador criado com sucesso",
    type: EmployeeResponseSwaggerDto
  })
  @ApiBadRequestResponse({ description: "Dados inválidos" })
  @ApiConflictResponse({ description: "Email já cadastrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Body(new ZodValidationPipe(CreateEmployeeSchema)) input: CreateEmployeeDto
  ) {
    const result = await this.createEmployee.execute(input);

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(EmployeePresenter.toHTTP(result.value.employee));
  }
}

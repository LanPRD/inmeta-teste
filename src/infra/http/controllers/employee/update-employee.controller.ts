import {
  UpdateEmployeeSchema,
  type UpdateEmployeeDto
} from "@/application/dtos";
import { UpdateEmployeeUseCase } from "@/application/use-cases/employees";
import { Body, Controller, Param, Patch } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from "@nestjs/swagger";
import { EmployeeResponseSwaggerDto } from "../../docs/employee-response.swagger.dto";
import { UpdateEmployeeSwaggerDto } from "../../docs/update-employee.swagger.dto";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { EmployeePresenter } from "../../presenters/employee-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Employees")
@Controller("employees")
export class UpdateEmployeeController {
  constructor(private readonly updateEmployee: UpdateEmployeeUseCase) {}

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza dados cadastrais do colaborador" })
  @ApiParam({
    name: "id",
    description: "ID do colaborador",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiBody({ type: UpdateEmployeeSwaggerDto })
  @ApiOkResponse({
    description: "Colaborador atualizado",
    type: EmployeeResponseSwaggerDto
  })
  @ApiBadRequestResponse({ description: "Dados inválidos" })
  @ApiNotFoundResponse({ description: "Colaborador não encontrado" })
  @ApiConflictResponse({ description: "Email já pertence a outro colaborador" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateEmployeeSchema)) input: UpdateEmployeeDto
  ) {
    const result = await this.updateEmployee.execute(id, input);

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(EmployeePresenter.toHTTP(result.value.employee));
  }
}

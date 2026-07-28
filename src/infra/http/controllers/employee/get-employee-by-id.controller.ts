import { GetEmployeeByIdUseCase } from "@/application/use-cases/employees";
import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from "@nestjs/swagger";
import { EmployeeResponseSwaggerDto } from "../../docs/employee-response.swagger.dto";
import { EmployeePresenter } from "../../presenters/employee-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Employees")
@Controller("employees")
export class GetEmployeeByIdController {
  constructor(private readonly getEmployeeById: GetEmployeeByIdUseCase) {}

  @Get(":id")
  @ApiOperation({ summary: "Busca um colaborador pelo ID" })
  @ApiParam({
    name: "id",
    description: "ID do colaborador",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiOkResponse({
    description: "Colaborador encontrado",
    type: EmployeeResponseSwaggerDto
  })
  @ApiNotFoundResponse({ description: "Colaborador não encontrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(@Param("id") id: string) {
    const result = await this.getEmployeeById.execute(id);

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(EmployeePresenter.toHTTP(result.value.employee));
  }
}

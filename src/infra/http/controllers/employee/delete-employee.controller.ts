import { DeleteEmployeeUseCase } from "@/application/use-cases/employees";
import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param
} from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from "@nestjs/swagger";

@ApiTags("Employees")
@Controller("employees")
export class DeleteEmployeeController {
  constructor(private readonly deleteEmployee: DeleteEmployeeUseCase) {}

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove um colaborador (soft delete)" })
  @ApiParam({
    name: "id",
    description: "ID do colaborador",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiNoContentResponse({ description: "Colaborador removido" })
  @ApiNotFoundResponse({ description: "Colaborador não encontrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(@Param("id") id: string) {
    const result = await this.deleteEmployee.execute(id);

    if (result.isLeft()) {
      throw result.value;
    }
  }
}

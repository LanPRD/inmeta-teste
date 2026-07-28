import { GetLinkedDocumentTypesUseCase } from "@/application/use-cases/employee-document-types";
import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from "@nestjs/swagger";
import { EmployeeDocumentTypeResponseSwaggerDto } from "../../docs/employee-document-type-response.swagger.dto";
import { EmployeeDocumentTypePresenter } from "../../presenters/employee-document-type-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Employee Document Types")
@Controller("employees")
export class GetLinkedDocumentTypesController {
  constructor(
    private readonly getLinkedDocumentTypes: GetLinkedDocumentTypesUseCase
  ) {}

  @Get(":employeeId/document-types")
  @ApiOperation({
    summary: "Lista tipos vinculados + status (pendente/enviado)"
  })
  @ApiParam({
    name: "employeeId",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiOkResponse({
    description: "Lista de vínculos ativos com status",
    type: [EmployeeDocumentTypeResponseSwaggerDto]
  })
  @ApiNotFoundResponse({ description: "Colaborador não encontrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(@Param("employeeId") employeeId: string) {
    const result = await this.getLinkedDocumentTypes.execute(employeeId);

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(
      result.value.links.map(({ link, status }) => ({
        ...EmployeeDocumentTypePresenter.toHTTP(link),
        status
      }))
    );
  }
}

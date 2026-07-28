import { LinkDocumentTypeUseCase } from "@/application/use-cases/employee-document-types";
import { Controller, Param, Post } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from "@nestjs/swagger";
import { EmployeeDocumentTypeResponseSwaggerDto } from "../../docs/employee-document-type-response.swagger.dto";
import { EmployeeDocumentTypePresenter } from "../../presenters/employee-document-type-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Employee Document Types")
@Controller("employees")
export class LinkDocumentTypeController {
  constructor(private readonly linkDocumentType: LinkDocumentTypeUseCase) {}

  @Post(":employeeId/document-types/:documentTypeId")
  @ApiOperation({ summary: "Vincula um tipo de documento ao colaborador" })
  @ApiParam({
    name: "employeeId",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiParam({
    name: "documentTypeId",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiCreatedResponse({
    description: "Vínculo criado",
    type: EmployeeDocumentTypeResponseSwaggerDto
  })
  @ApiNotFoundResponse({
    description: "Colaborador ou tipo de documento não encontrado"
  })
  @ApiConflictResponse({ description: "Tipo de documento já vinculado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Param("employeeId") employeeId: string,
    @Param("documentTypeId") documentTypeId: string
  ) {
    const result = await this.linkDocumentType.execute(
      employeeId,
      documentTypeId
    );

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(
      EmployeeDocumentTypePresenter.toHTTP(result.value.link)
    );
  }
}

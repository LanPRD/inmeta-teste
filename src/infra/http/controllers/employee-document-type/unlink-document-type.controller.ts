import { UnlinkDocumentTypeUseCase } from "@/application/use-cases/employee-document-types";
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

@ApiTags("Employee Document Types")
@Controller("employees")
export class UnlinkDocumentTypeController {
  constructor(private readonly unlinkDocumentType: UnlinkDocumentTypeUseCase) {}

  @Delete(":employeeId/document-types/:documentTypeId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desvincula um tipo de documento do colaborador" })
  @ApiParam({
    name: "employeeId",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiParam({
    name: "documentTypeId",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiNoContentResponse({ description: "Vínculo removido" })
  @ApiNotFoundResponse({ description: "Vínculo não encontrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Param("employeeId") employeeId: string,
    @Param("documentTypeId") documentTypeId: string
  ) {
    const result = await this.unlinkDocumentType.execute(
      employeeId,
      documentTypeId
    );

    if (result.isLeft()) {
      throw result.value;
    }
  }
}

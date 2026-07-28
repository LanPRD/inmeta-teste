import { GetDocumentTypeByIdUseCase } from "@/application/use-cases/document-types";
import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from "@nestjs/swagger";
import { DocumentTypeResponseSwaggerDto } from "../../docs/document-type-response.swagger.dto";
import { DocumentTypePresenter } from "../../presenters/document-type-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Document Types")
@Controller("document-types")
export class GetDocumentTypeByIdController {
  constructor(
    private readonly getDocumentTypeById: GetDocumentTypeByIdUseCase
  ) {}

  @Get(":id")
  @ApiOperation({ summary: "Busca um tipo de documento pelo ID" })
  @ApiParam({ name: "id", example: "550e8400-e29b-41d4-a716-446655440000" })
  @ApiOkResponse({
    description: "Tipo de documento encontrado",
    type: DocumentTypeResponseSwaggerDto
  })
  @ApiNotFoundResponse({ description: "Tipo de documento não encontrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(@Param("id") id: string) {
    const result = await this.getDocumentTypeById.execute(id);

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(
      DocumentTypePresenter.toHTTP(result.value.documentType)
    );
  }
}

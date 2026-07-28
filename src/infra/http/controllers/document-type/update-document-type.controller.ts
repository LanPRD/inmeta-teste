import {
  UpdateDocumentTypeSchema,
  type UpdateDocumentTypeDto
} from "@/application/dtos";
import { UpdateDocumentTypeUseCase } from "@/application/use-cases/document-types";
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
import { DocumentTypeResponseSwaggerDto } from "../../docs/document-type-response.swagger.dto";
import { UpdateDocumentTypeSwaggerDto } from "../../docs/update-document-type.swagger.dto";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { DocumentTypePresenter } from "../../presenters/document-type-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Document Types")
@Controller("document-types")
export class UpdateDocumentTypeController {
  constructor(private readonly updateDocumentType: UpdateDocumentTypeUseCase) {}

  @Patch(":id")
  @ApiOperation({ summary: "Atualiza um tipo de documento" })
  @ApiParam({ name: "id", example: "550e8400-e29b-41d4-a716-446655440000" })
  @ApiBody({ type: UpdateDocumentTypeSwaggerDto })
  @ApiOkResponse({
    description: "Tipo de documento atualizado",
    type: DocumentTypeResponseSwaggerDto
  })
  @ApiBadRequestResponse({ description: "Dados inválidos" })
  @ApiNotFoundResponse({ description: "Tipo de documento não encontrado" })
  @ApiConflictResponse({ description: "Nome já pertence a outro tipo" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateDocumentTypeSchema))
    input: UpdateDocumentTypeDto
  ) {
    const result = await this.updateDocumentType.execute(id, input);

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(
      DocumentTypePresenter.toHTTP(result.value.documentType)
    );
  }
}

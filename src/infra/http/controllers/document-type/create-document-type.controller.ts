import {
  CreateDocumentTypeSchema,
  type CreateDocumentTypeDto
} from "@/application/dtos";
import { CreateDocumentTypeUseCase } from "@/application/use-cases/document-types";
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
import { CreateDocumentTypeSwaggerDto } from "../../docs/create-document-type.swagger.dto";
import { DocumentTypeResponseSwaggerDto } from "../../docs/document-type-response.swagger.dto";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { DocumentTypePresenter } from "../../presenters/document-type-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Document Types")
@Controller("document-types")
export class CreateDocumentTypeController {
  constructor(private readonly createDocumentType: CreateDocumentTypeUseCase) {}

  @Post()
  @ApiOperation({ summary: "Cria um tipo de documento" })
  @ApiBody({ type: CreateDocumentTypeSwaggerDto })
  @ApiCreatedResponse({
    description: "Tipo de documento criado",
    type: DocumentTypeResponseSwaggerDto
  })
  @ApiBadRequestResponse({ description: "Dados inválidos" })
  @ApiConflictResponse({ description: "Nome já cadastrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Body(new ZodValidationPipe(CreateDocumentTypeSchema))
    input: CreateDocumentTypeDto
  ) {
    const result = await this.createDocumentType.execute(input);

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(
      DocumentTypePresenter.toHTTP(result.value.documentType)
    );
  }
}

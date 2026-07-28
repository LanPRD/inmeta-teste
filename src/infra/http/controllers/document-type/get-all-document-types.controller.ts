import {
  GetAllDocumentTypesSchema,
  type GetAllDocumentTypesDto
} from "@/application/dtos";
import { GetAllDocumentTypesUseCase } from "@/application/use-cases/document-types";
import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import { DocumentTypeResponseSwaggerDto } from "../../docs/document-type-response.swagger.dto";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { DocumentTypePresenter } from "../../presenters/document-type-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Document Types")
@Controller("document-types")
export class GetAllDocumentTypesController {
  constructor(
    private readonly getAllDocumentTypes: GetAllDocumentTypesUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: "Lista tipos de documento paginados" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "name", required: false, example: "ASO" })
  @ApiQuery({ name: "includeDeleted", required: false, example: false })
  @ApiOkResponse({
    description: "Lista paginada",
    type: [DocumentTypeResponseSwaggerDto]
  })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Query(new ZodValidationPipe(GetAllDocumentTypesSchema))
    query: GetAllDocumentTypesDto
  ) {
    const result = await this.getAllDocumentTypes.execute(query);

    if (result.isLeft()) {
      throw result.value;
    }

    const { documentTypes, meta } = result.value;

    return ApiResponse.paginated(
      documentTypes.map(DocumentTypePresenter.toHTTP),
      meta
    );
  }
}

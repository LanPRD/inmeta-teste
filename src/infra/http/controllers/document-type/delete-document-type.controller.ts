import { DeleteDocumentTypeUseCase } from "@/application/use-cases/document-types";
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

@ApiTags("Document Types")
@Controller("document-types")
export class DeleteDocumentTypeController {
  constructor(private readonly deleteDocumentType: DeleteDocumentTypeUseCase) {}

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove um tipo de documento (soft delete)" })
  @ApiParam({ name: "id", example: "550e8400-e29b-41d4-a716-446655440000" })
  @ApiNoContentResponse({ description: "Tipo de documento removido" })
  @ApiNotFoundResponse({ description: "Tipo de documento não encontrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(@Param("id") id: string) {
    const result = await this.deleteDocumentType.execute(id);

    if (result.isLeft()) {
      throw result.value;
    }
  }
}

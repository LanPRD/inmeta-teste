import { PaginationSchema, type PaginationDto } from "@/application/dtos";
import { GetPendingDocumentsUseCase } from "@/application/use-cases/document-submissions";
import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import { PendingDocumentResponseSwaggerDto } from "../../docs/pending-document-response.swagger.dto";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { ApiResponse } from "../../response";

@ApiTags("Pending Documents")
@Controller("documents")
export class GetPendingDocumentsController {
  constructor(
    private readonly getPendingDocuments: GetPendingDocumentsUseCase
  ) {}

  @Get("pending")
  @ApiOperation({ summary: "Lista pendências globais" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiOkResponse({
    description: "Lista de pendências",
    type: [PendingDocumentResponseSwaggerDto]
  })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Query(new ZodValidationPipe(PaginationSchema)) query: PaginationDto
  ) {
    const result = await this.getPendingDocuments.execute(query);

    if (result.isLeft()) {
      throw result.value;
    }

    const { pending, meta } = result.value;

    return ApiResponse.paginated(pending, meta);
  }
}

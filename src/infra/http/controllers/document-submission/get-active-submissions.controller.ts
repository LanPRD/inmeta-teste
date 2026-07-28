import { GetActiveSubmissionsUseCase } from "@/application/use-cases/document-submissions";
import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import { DocumentSubmissionResponseSwaggerDto } from "../../docs/document-submission-response.swagger.dto";
import { DocumentSubmissionPresenter } from "../../presenters/document-submission-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Document Submissions")
@Controller("employees")
export class GetActiveSubmissionsController {
  constructor(
    private readonly getActiveSubmissions: GetActiveSubmissionsUseCase
  ) {}

  @Get(":employeeId/documents")
  @ApiOperation({ summary: "Lista envios ativos do colaborador" })
  @ApiParam({
    name: "employeeId",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiQuery({ name: "documentTypeId", required: false })
  @ApiOkResponse({
    description: "Envios ativos",
    type: [DocumentSubmissionResponseSwaggerDto]
  })
  @ApiNotFoundResponse({ description: "Colaborador não encontrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Param("employeeId") employeeId: string,
    @Query("documentTypeId") documentTypeId?: string
  ) {
    const result = await this.getActiveSubmissions.execute(
      employeeId,
      documentTypeId
    );

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(
      result.value.submissions.map(DocumentSubmissionPresenter.toHTTP)
    );
  }
}

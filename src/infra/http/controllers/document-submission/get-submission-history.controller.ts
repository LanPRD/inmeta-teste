import { GetSubmissionHistoryUseCase } from "@/application/use-cases/document-submissions";
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
export class GetSubmissionHistoryController {
  constructor(
    private readonly getSubmissionHistory: GetSubmissionHistoryUseCase
  ) {}

  @Get(":employeeId/documents/:documentTypeId/history")
  @ApiOperation({ summary: "Histórico de versões de um tipo de documento" })
  @ApiParam({
    name: "employeeId",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiParam({
    name: "documentTypeId",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiQuery({
    name: "includeDeleted",
    required: false,
    description: "Inclui versões soft-deletadas no histórico"
  })
  @ApiOkResponse({
    description: "Histórico de versões",
    type: [DocumentSubmissionResponseSwaggerDto]
  })
  @ApiNotFoundResponse({ description: "Colaborador não encontrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Param("employeeId") employeeId: string,
    @Param("documentTypeId") documentTypeId: string,
    @Query("includeDeleted") includeDeleted?: string
  ) {
    const result = await this.getSubmissionHistory.execute(
      employeeId,
      documentTypeId,
      includeDeleted === "true"
    );

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(
      result.value.submissions.map(DocumentSubmissionPresenter.toHTTP)
    );
  }
}

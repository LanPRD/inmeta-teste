import {
  CreateDocumentSubmissionSchema,
  type CreateDocumentSubmissionDto
} from "@/application/dtos";
import { SubmitDocumentUseCase } from "@/application/use-cases/document-submissions";
import { Body, Controller, Param, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from "@nestjs/swagger";
import { CreateDocumentSubmissionSwaggerDto } from "../../docs/create-document-submission.swagger.dto";
import { DocumentSubmissionResponseSwaggerDto } from "../../docs/document-submission-response.swagger.dto";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { DocumentSubmissionPresenter } from "../../presenters/document-submission-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Document Submissions")
@Controller("employees")
export class SubmitDocumentController {
  constructor(private readonly submitDocument: SubmitDocumentUseCase) {}

  @Post(":employeeId/documents")
  @ApiOperation({ summary: "Registra envio de documento (novo ou reenvio)" })
  @ApiParam({
    name: "employeeId",
    example: "550e8400-e29b-41d4-a716-446655440000"
  })
  @ApiBody({ type: CreateDocumentSubmissionSwaggerDto })
  @ApiCreatedResponse({
    description: "Documento enviado",
    type: DocumentSubmissionResponseSwaggerDto
  })
  @ApiBadRequestResponse({ description: "Dados inválidos" })
  @ApiNotFoundResponse({ description: "Colaborador não encontrado" })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Param("employeeId") employeeId: string,
    @Body(new ZodValidationPipe(CreateDocumentSubmissionSchema))
    input: CreateDocumentSubmissionDto
  ) {
    const result = await this.submitDocument.execute(employeeId, input);

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(
      DocumentSubmissionPresenter.toHTTP(result.value.submission)
    );
  }
}

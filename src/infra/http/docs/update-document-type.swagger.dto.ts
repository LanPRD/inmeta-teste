import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateDocumentTypeSwaggerDto {
  @ApiPropertyOptional({ example: "ASO Atualizado", description: "Novo nome" })
  name?: string;

  @ApiPropertyOptional({
    example: "Nova descrição",
    description: "Nova descrição"
  })
  description?: string;
}

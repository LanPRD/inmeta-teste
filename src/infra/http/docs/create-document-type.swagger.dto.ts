import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateDocumentTypeSwaggerDto {
  @ApiProperty({ example: "ASO", description: "Nome do tipo de documento" })
  name!: string;

  @ApiPropertyOptional({
    example: "Atestado de Saúde Ocupacional",
    description: "Descrição do tipo de documento"
  })
  description?: string;
}

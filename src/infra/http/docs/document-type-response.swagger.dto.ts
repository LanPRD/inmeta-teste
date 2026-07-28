import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DocumentTypeResponseSwaggerDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "ASO" })
  name!: string;

  @ApiPropertyOptional({ example: "Atestado de Saúde Ocupacional" })
  description?: string;

  @ApiProperty({ example: "2026-07-27T12:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-07-27T12:00:00.000Z" })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: null })
  deletedAt!: Date | null;
}

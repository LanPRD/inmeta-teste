import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class EmployeeDocumentTypeResponseSwaggerDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  employeeId!: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  documentTypeId!: string;

  @ApiProperty({ example: "2026-07-28T12:00:00.000Z" })
  linkedAt!: Date;

  @ApiPropertyOptional({ example: null })
  unlinkedAt!: Date | null;
}

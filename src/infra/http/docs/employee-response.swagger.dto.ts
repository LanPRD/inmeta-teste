import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class EmployeeResponseSwaggerDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  @ApiProperty({ example: "John Doe" })
  name!: string;

  @ApiProperty({ example: "john@example.com" })
  email!: string;

  @ApiProperty({ example: "2026-07-27T12:00:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2026-07-27T12:00:00.000Z" })
  updatedAt!: Date;

  @ApiPropertyOptional({
    example: null,
    description: "Data da exclusão lógica — null = ativo"
  })
  deletedAt!: Date | null;
}

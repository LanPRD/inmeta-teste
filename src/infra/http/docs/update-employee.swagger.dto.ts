import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateEmployeeSwaggerDto {
  @ApiPropertyOptional({
    example: "John Doe",
    description: "Novo nome do colaborador"
  })
  name?: string;

  @ApiPropertyOptional({
    example: "john@example.com",
    description: "Novo email único do colaborador"
  })
  email?: string;
}

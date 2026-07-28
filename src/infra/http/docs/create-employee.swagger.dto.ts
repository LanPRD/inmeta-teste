import { ApiProperty } from "@nestjs/swagger";

export class CreateEmployeeSwaggerDto {
  @ApiProperty({ example: "John Doe", description: "Nome do colaborador" })
  name!: string;

  @ApiProperty({
    example: "john@example.com",
    description: "Email único do colaborador"
  })
  email!: string;
}

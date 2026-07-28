import { ApiProperty } from "@nestjs/swagger";

export class CreateDocumentSubmissionSwaggerDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "ID do tipo de documento"
  })
  documentTypeId!: string;
}

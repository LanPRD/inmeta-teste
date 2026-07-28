import { ApiProperty } from "@nestjs/swagger";

class CompletionSwaggerDto {
  @ApiProperty({ example: 120 })
  totalRequired!: number;

  @ApiProperty({ example: 87 })
  totalFulfilled!: number;

  @ApiProperty({ example: 72.5 })
  percentage!: number;
}

class MostPendingSwaggerDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  documentTypeId!: string;

  @ApiProperty({ example: "ASO" })
  documentTypeName!: string;

  @ApiProperty({ example: 14 })
  pendingCount!: number;
}

class RecentSubmissionSwaggerDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  employeeId!: string;

  @ApiProperty({ example: "John Doe" })
  employeeName!: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  documentTypeId!: string;

  @ApiProperty({ example: "ASO" })
  documentTypeName!: string;

  @ApiProperty({ example: 2 })
  version!: number;

  @ApiProperty({ example: "2026-07-28T12:00:00.000Z" })
  submittedAt!: Date;
}

export class StatsResponseSwaggerDto {
  @ApiProperty({ type: CompletionSwaggerDto })
  completion!: CompletionSwaggerDto;

  @ApiProperty({ type: [MostPendingSwaggerDto] })
  mostPendingDocumentTypes!: MostPendingSwaggerDto[];

  @ApiProperty({ type: [RecentSubmissionSwaggerDto] })
  recentSubmissions!: RecentSubmissionSwaggerDto[];
}

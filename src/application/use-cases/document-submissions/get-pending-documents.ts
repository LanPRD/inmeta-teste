import { PaginationSchema, type PaginationDto } from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { InternalError, ValidationError } from "@/core/errors";
import {
  DocumentSubmissionRepository,
  type FindPendingResult
} from "@/domain/repositories";
import { Injectable, Logger } from "@nestjs/common";

type GetPendingDocumentsUseCaseResponse = Either<
  ValidationError | InternalError,
  {
    pending: FindPendingResult[];
    meta: { page: number; limit: number; total: number };
  }
>;

@Injectable()
export class GetPendingDocumentsUseCase {
  private readonly logger = new Logger(GetPendingDocumentsUseCase.name);

  constructor(
    private readonly submissionRepository: DocumentSubmissionRepository
  ) {}

  async execute(
    input: PaginationDto
  ): Promise<GetPendingDocumentsUseCaseResponse> {
    try {
      const parsed = PaginationSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid query parameters"));
      }

      const { page, limit } = parsed.data;

      const { data, total } = await this.submissionRepository.findPending(
        page,
        limit
      );

      return right({
        pending: data,
        meta: { page, limit, total }
      });
    } catch (error) {
      this.logger.error("Failed to fetch pending documents", error);
      return left(new InternalError("Failed to fetch pending documents"));
    }
  }
}

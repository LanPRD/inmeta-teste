import {
  GetPendingDocumentsSchema,
  type GetPendingDocumentsDto
} from "@/application/dtos";
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
    input: GetPendingDocumentsDto
  ): Promise<GetPendingDocumentsUseCaseResponse> {
    try {
      const parsed = GetPendingDocumentsSchema.safeParse(input);

      if (!parsed.success) {
        return left(new ValidationError("Invalid query parameters"));
      }

      const { page, limit, employeeId, documentTypeId } = parsed.data;

      const { data, total } = await this.submissionRepository.findPending(
        page,
        limit,
        { employeeId, documentTypeId }
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

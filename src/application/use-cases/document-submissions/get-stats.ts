import { left, right, type Either } from "@/core/either";
import { InternalError } from "@/core/errors";
import {
  DocumentSubmissionRepository,
  type MostPendingResult,
  type RecentSubmissionResult
} from "@/domain/repositories/document-submission-repository";
import { Injectable, Logger } from "@nestjs/common";

type GetStatsUseCaseResponse = Either<
  InternalError,
  {
    completion: {
      totalRequired: number;
      totalFulfilled: number;
      percentage: number;
    };
    mostPendingDocumentTypes: MostPendingResult[];
    recentSubmissions: RecentSubmissionResult[];
  }
>;

@Injectable()
export class GetStatsUseCase {
  private readonly logger = new Logger(GetStatsUseCase.name);

  constructor(
    private readonly submissionRepository: DocumentSubmissionRepository
  ) {}

  async execute(): Promise<GetStatsUseCaseResponse> {
    try {
      const stats = await this.submissionRepository.getStats();

      const percentage =
        stats.totalRequired > 0 ?
          Math.round((stats.totalFulfilled / stats.totalRequired) * 1000) / 10
        : 0;

      return right({
        completion: {
          totalRequired: stats.totalRequired,
          totalFulfilled: stats.totalFulfilled,
          percentage
        },
        mostPendingDocumentTypes: stats.mostPending,
        recentSubmissions: stats.recentSubmissions
      });
    } catch (error) {
      this.logger.error("Failed to fetch stats", error);
      return left(new InternalError("Failed to fetch stats"));
    }
  }
}

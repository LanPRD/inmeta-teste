import {
  GetActiveSubmissionsUseCase,
  GetPendingDocumentsUseCase,
  GetStatsUseCase,
  GetSubmissionHistoryUseCase,
  SubmitDocumentUseCase
} from "@/application/use-cases/document-submissions";
import { DocumentSubmissionRepository } from "@/domain/repositories/document-submission-repository";
import { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import { EmployeeDocumentTypeRepository } from "@/domain/repositories/employee-document-type-repository";
import { EmployeeRepository } from "@/domain/repositories/employee-repository";
import { PrismaDocumentSubmissionRepository } from "@/infra/database/repositories/prisma-document-submission.repository";
import { PrismaDocumentTypeRepository } from "@/infra/database/repositories/prisma-document-type.repository";
import { PrismaEmployeeDocumentTypeRepository } from "@/infra/database/repositories/prisma-employee-document-type.repository";
import { PrismaEmployeeRepository } from "@/infra/database/repositories/prisma-employee.repository";
import { Module } from "@nestjs/common";
import { GetActiveSubmissionsController } from "./get-active-submissions.controller";
import { GetPendingDocumentsController } from "./get-pending-documents.controller";
import { GetStatsController } from "./get-stats.controller";
import { GetSubmissionHistoryController } from "./get-submission-history.controller";
import { SubmitDocumentController } from "./submit-document.controller";

@Module({
  controllers: [
    SubmitDocumentController,
    GetActiveSubmissionsController,
    GetSubmissionHistoryController,
    GetPendingDocumentsController,
    GetStatsController
  ],
  providers: [
    {
      provide: EmployeeRepository,
      useClass: PrismaEmployeeRepository
    },
    {
      provide: DocumentTypeRepository,
      useClass: PrismaDocumentTypeRepository
    },
    {
      provide: EmployeeDocumentTypeRepository,
      useClass: PrismaEmployeeDocumentTypeRepository
    },
    {
      provide: DocumentSubmissionRepository,
      useClass: PrismaDocumentSubmissionRepository
    },
    SubmitDocumentUseCase,
    GetActiveSubmissionsUseCase,
    GetSubmissionHistoryUseCase,
    GetPendingDocumentsUseCase,
    GetStatsUseCase
  ]
})
export class DocumentSubmissionModule {}

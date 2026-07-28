import {
  GetLinkedDocumentTypesUseCase,
  LinkDocumentTypeUseCase,
  UnlinkDocumentTypeUseCase
} from "@/application/use-cases/employee-document-types";
import { DocumentSubmissionRepository } from "@/domain/repositories/document-submission-repository";
import { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import { EmployeeDocumentTypeRepository } from "@/domain/repositories/employee-document-type-repository";
import { EmployeeRepository } from "@/domain/repositories/employee-repository";
import { PrismaDocumentSubmissionRepository } from "@/infra/database/repositories/prisma-document-submission.repository";
import { PrismaDocumentTypeRepository } from "@/infra/database/repositories/prisma-document-type.repository";
import { PrismaEmployeeDocumentTypeRepository } from "@/infra/database/repositories/prisma-employee-document-type.repository";
import { PrismaEmployeeRepository } from "@/infra/database/repositories/prisma-employee.repository";
import { Module } from "@nestjs/common";
import { GetLinkedDocumentTypesController } from "./get-linked-document-types.controller";
import { LinkDocumentTypeController } from "./link-document-type.controller";
import { UnlinkDocumentTypeController } from "./unlink-document-type.controller";

@Module({
  controllers: [
    LinkDocumentTypeController,
    UnlinkDocumentTypeController,
    GetLinkedDocumentTypesController
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
    LinkDocumentTypeUseCase,
    UnlinkDocumentTypeUseCase,
    GetLinkedDocumentTypesUseCase
  ]
})
export class EmployeeDocumentTypeModule {}

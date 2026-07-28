import {
  CreateDocumentTypeUseCase,
  DeleteDocumentTypeUseCase,
  GetAllDocumentTypesUseCase,
  GetDocumentTypeByIdUseCase,
  UpdateDocumentTypeUseCase
} from "@/application/use-cases/document-types";
import { DocumentTypeRepository } from "@/domain/repositories/document-type-repository";
import { PrismaDocumentTypeRepository } from "@/infra/database/repositories/prisma-document-type.repository";
import { Module } from "@nestjs/common";
import { CreateDocumentTypeController } from "./create-document-type.controller";
import { DeleteDocumentTypeController } from "./delete-document-type.controller";
import { GetAllDocumentTypesController } from "./get-all-document-types.controller";
import { GetDocumentTypeByIdController } from "./get-document-type-by-id.controller";
import { UpdateDocumentTypeController } from "./update-document-type.controller";

@Module({
  controllers: [
    CreateDocumentTypeController,
    GetAllDocumentTypesController,
    GetDocumentTypeByIdController,
    UpdateDocumentTypeController,
    DeleteDocumentTypeController
  ],
  providers: [
    {
      provide: DocumentTypeRepository,
      useClass: PrismaDocumentTypeRepository
    },
    CreateDocumentTypeUseCase,
    GetAllDocumentTypesUseCase,
    GetDocumentTypeByIdUseCase,
    UpdateDocumentTypeUseCase,
    DeleteDocumentTypeUseCase
  ]
})
export class DocumentTypeModule {}

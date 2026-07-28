import { Module } from "@nestjs/common";
import { DocumentTypeModule } from "./controllers/document-type/document-type.module";
import { EmployeeDocumentTypeModule } from "./controllers/employee-document-type/employee-document-type.module";
import { EmployeeModule } from "./controllers/employee/employee.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    HealthModule,
    EmployeeModule,
    DocumentTypeModule,
    EmployeeDocumentTypeModule
  ]
})
export class HttpModule {}

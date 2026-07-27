-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('ACTIVE', 'SUPERSEDED');

-- CreateTable
CREATE TABLE "EmployeeDocumentType" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlinkedAt" TIMESTAMP(3),

    CONSTRAINT "EmployeeDocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSubmission" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'ACTIVE',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSubmission_employeeId_documentTypeId_version_key" ON "DocumentSubmission"("employeeId", "documentTypeId", "version");

-- AddForeignKey
ALTER TABLE "EmployeeDocumentType" ADD CONSTRAINT "EmployeeDocumentType_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocumentType" ADD CONSTRAINT "EmployeeDocumentType_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSubmission" ADD CONSTRAINT "DocumentSubmission_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSubmission" ADD CONSTRAINT "DocumentSubmission_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

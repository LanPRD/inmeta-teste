-- Torna a unicidade de Employee.email e DocumentType.name relativa apenas aos
-- registros ativos (deletedAt IS NULL), permitindo reaproveitar um email/nome
-- depois de um soft delete. DocumentType.name também passa a ser
-- case-insensitive, alinhando a constraint física com a busca já existente em
-- findByName ("ASO" e "aso" são tratados como o mesmo nome).

-- DropIndex
DROP INDEX "Employee_email_key";

-- DropIndex
DROP INDEX "DocumentType_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_active_key" ON "Employee"("email") WHERE "deletedAt" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_name_active_key" ON "DocumentType"(lower("name")) WHERE "deletedAt" IS NULL;

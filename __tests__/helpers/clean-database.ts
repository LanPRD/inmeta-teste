import type { PrismaService } from "@/infra/database/prisma/prisma.service";

/**
 * Limpa todas as tabelas entre testes de integração.
 * A ordem respeita as FK constraints (folhas primeiro).
 */
export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.documentSubmission.deleteMany();
  await prisma.employeeDocumentType.deleteMany();
  await prisma.documentType.deleteMany();
  await prisma.employee.deleteMany();
}

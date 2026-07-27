# Inmeta — Gestão de Documentação de Colaboradores

API RESTful para controlar quais documentos cada colaborador precisa enviar, o
que já foi enviado, em qual versão, e o que ainda está pendente.

## Stack

NestJS (Fastify) · PostgreSQL + Prisma · Zod · Vitest · Docker Compose ·
semantic-release

## Arquitetura

Clean Architecture em 4 camadas, sem dependência de framework nas camadas
internas:

| Camada        | Conteúdo                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| `core`        | `Entity`/`UniqueEntityId`, `Either`, `HttpStatus`, hierarquia de `AppError` |
| `domain`      | entities, enums, repositories (interfaces), value-objects                   |
| `application` | use-cases, dtos (contratos de entrada/saída dos use-cases)                  |
| `infra`       | env, database (Prisma), http (controllers, dtos, presenters, filtros)       |

Regra: `core`/`domain`/`application` não importam nada de `infra` nem de
bibliotecas de framework (NestJS, Prisma). A dependência é sempre de fora pra
dentro.

## Modelagem de dados

| Entidade               | O que representa                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Employee`             | o colaborador                                                                                                          |
| `DocumentType`         | catálogo de tipos de documento (CPF, ASO, Certidão...), **não** pertence a um colaborador específico — é compartilhado |
| `EmployeeDocumentType` | a relação "este colaborador precisa enviar este tipo" (vínculo/desvínculo)                                             |
| `DocumentSubmission`   | o envio em si, versionado — cada reenvio é uma linha nova, só a mais recente fica `ACTIVE`                             |

`DocumentType` e `EmployeeDocumentType` são entidades separadas porque o
cadastro de tipos de documento é pedido no enunciado como algo independente de
qualquer colaborador (você cria "ASO" uma vez, não uma vez por colaborador), e
as estatísticas de "tipos mais pendentes" precisam agrupar por tipo entre todos
os colaboradores.

## Decisões técnicas

| Decisão                                                                             | Alternativa considerada                   | Por quê                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DTOs com Zod (`z.object` + `z.infer`)                                               | `class-validator` + decorators            | Zod é standalone (agnóstico a framework), o schema e o tipo TypeScript são uma fonte única de verdade, e a validação é reutilizável fora do HTTP (use-cases, testes, CLI). O pipe `ZodValidationPipe` genérico na infra substitui o `ValidationPipe` padrão do Nest.                               |
| `@nestjs/config` + Zod (`validate`) para env                                        | dotenv + parsing manual                   | padrão que já uso em outros projetos NestJS meus; Zod garante fail-fast em env inválida                                                                                                                                                                                                            |
| Fastify como HTTP adapter                                                           | Express (padrão do Nest CLI)              | melhor throughput; exigiu `@fastify/static` (dependência do próprio `@nestjs/swagger` pra servir a UI)                                                                                                                                                                                             |
| Vitest                                                                              | Jest (padrão do Nest CLI)                 | mais rápido (SWC), já uso em outros projetos meus                                                                                                                                                                                                                                                  |
| Prisma com gerador clássico `prisma-client-js`                                      | gerador novo `prisma-client` (Prisma 7)   | o gerador novo emite `import.meta.url`, incompatível com o build CommonJS do Nest — quebrava em produção e nos testes                                                                                                                                                                              |
| Soft delete sem cascade físico                                                      | cascatear `deletedAt` para tabelas filhas | cada linha guarda seu próprio `deletedAt`; "sumir" de listagens é um filtro na query (`JOIN` + `WHERE parent.deletedAt IS NULL`), não uma escrita em massa. Preserva histórico puro e evita transações grandes a cada exclusão                                                                     |
| Erros de domínio como `AppError` (core) + `ExceptionFilter` (infra)                 | `HttpException` do Nest direto no domínio | mantém `core`/`domain` sem dependência do NestJS; o filtro em `infra/http` traduz `AppError` pro formato HTTP                                                                                                                                                                                      |
| `semantic-release` só com GitHub Releases (sem `@semantic-release/git`/`changelog`) | versionar `CHANGELOG.md` no repo          | o plugin de changelog commita de volta via bot — o desafio pede que só o autor commite                                                                                                                                                                                                             |
| Validação no use-case com `safeParse` (defesa em profundidade)                      | confiar só no pipe HTTP                   | o use-case pode ser chamado fora do HTTP (testes, CLI, jobs). `parse()` lançaria exceção que o `try/catch` transformaria em 500; `safeParse` + retorno `left(ValidationError)` preserva o erro 422 corretamente. O custo de validar duas vezes (pipe + use-case) é desprezível frente à segurança. |

## Rodando localmente

```bash
cp .env.example .env
npm install
npm run db:up        # sobe Postgres via docker-compose
npm run prisma:migrate
npm run start:dev
```

Swagger em `http://localhost:3000/docs` · Healthcheck em `GET /health` (valida
conexão real com o banco).

## Testes

```text
__tests__/
├── unit/          # testes unitários (use-cases, entities, value-objects)
├── integration/   # testes contra banco real (repositories)
└── e2e/           # testes ponta a ponta via HTTP
```

```bash
npm test          # unitários
npm run test:e2e  # e2e
```

## CI/CD

`.github/workflows/release.yml`: em todo push na `master`, roda lint → build →
testes unitários → e2e (com Postgres real como service container). Só se tudo
passar, o job de `release` roda e gera uma GitHub Release automática
(versionamento semântico a partir de Conventional Commits).

## O que ainda falta

- Use-cases e endpoints das regras de negócio (cadastro, vínculo, envio,
  pendências, estatísticas) — o schema/entidades de domínio estão prontos, a
  camada de aplicação e os controllers ainda não.
- Migration do Prisma criando as tabelas (schema já modelado, migration ainda
  não gerada).
- Testes de integração (pasta criada, sem conteúdo ainda).

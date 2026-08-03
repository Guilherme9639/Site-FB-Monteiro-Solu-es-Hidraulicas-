# Contexto do projeto — Backend e painel administrativo

Última atualização: 03/08/2026

Este arquivo registra o contexto técnico da parte de backend do projeto FB Monteiro Soluções Hidráulicas. Ele deve ser atualizado ao final de cada etapa relevante para manter as decisões, riscos e próximos passos documentados.

## Objetivo da minha parte

Desenvolver o backend e, posteriormente, o painel administrativo para permitir:

- criar e editar projetos realizados;
- adicionar, editar, ordenar e remover imagens de projetos;
- adicionar, editar e remover descrições de projetos e imagens;
- publicar ou ocultar projetos sem excluí-los;
- gerenciar separadamente imagens gerais do site e imagens pertencentes a projetos;
- consultar e administrar contatos recebidos pelo formulário público.

## Estado do repositório no início desta etapa

O projeto já possuía:

- frontend em JavaScript com Vite;
- backend em Node.js com Express;
- rota `GET /api/health`;
- rota `POST /api/contatos`;
- armazenamento de contatos somente em um array em memória;
- nenhuma autenticação, banco, upload ou rota administrativa.

## Decisões técnicas

- O banco inicial é SQLite.
- O ORM é Prisma `6.19.3`.
- A arquitetura deve permanecer compatível com uma futura migração para PostgreSQL.
- As consultas ao banco devem passar pelo Prisma.
- Migrations devem ser versionadas no Git.
- Imagens não serão armazenadas como binários no banco; serão armazenados URL, identificador de armazenamento e metadados.
- O armazenamento local pode ser usado durante o desenvolvimento, mas deverá ficar isolado atrás de uma camada substituível por Cloudinary, Supabase Storage ou S3 compatível.
- O arquivo `.env` é local e não deve ser versionado; o repositório mantém apenas `.env.example`.

## Implementado nesta etapa

### Banco de dados

Arquivos principais:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260803154054_init/migration.sql`
- `backend/src/lib/prisma.js`

O primeiro modelo persistido é `Contact`:

- `id` UUID;
- `name`;
- `phone`;
- `message`;
- `status`, iniciado com `PENDING`;
- `createdAt`;
- `updatedAt`.

O banco local é `backend/prisma/dev.db`, ignorado pelo Git.

### API de contatos

`POST /api/contatos` agora grava os dados no SQLite usando Prisma.

Validações atuais:

- nome, telefone e mensagem obrigatórios;
- nome com até 120 caracteres;
- telefone com até 30 caracteres;
- mensagem com até 2.000 caracteres;
- resposta pública limitada a identificador e data de criação, sem devolver todos os dados enviados.

A rota `GET /api/contatos` foi removida da API pública. A futura listagem deverá ficar sob rota administrativa autenticada.

### Proteções adicionadas

- corpo JSON limitado a `32kb`;
- rate limit para contatos: 5 solicitações por IP a cada 15 minutos;
- middleware global de erro;
- banco e credenciais configurados por variáveis de ambiente;
- dependências auditadas, sem vulnerabilidades conhecidas após `npm audit fix`.

## Comandos do backend

Executar dentro de `backend` ou usar os scripts com `--prefix backend` a partir da raiz:

```bash
npm run dev
npm run start
npm run db:validate
npm run db:generate
npm run db:migrate -- --name nome-da-mudanca
npm run db:deploy
npm run db:studio
```

Em desenvolvimento, a sequência normal após alterar o schema é:

```bash
npm run db:validate
npm run db:migrate -- --name descricao-da-mudanca
npm run db:generate
```

## Variáveis de ambiente

O arquivo local `backend/.env` deve conter, no mínimo:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
```

Nunca inserir senhas, tokens ou URLs privadas neste arquivo de contexto ou no `.env.example`.

## Verificações realizadas nesta etapa

- `prisma validate`: aprovado;
- `prisma generate`: aprovado;
- migration inicial: criada e aplicada;
- `GET /api/health`: aprovado;
- criação de contato via API: aprovada;
- contato confirmado no SQLite após reiniciar o processo;
- `GET /api/contatos`: não público, retorna 404;
- build do frontend: aprovado;
- `node --check` nos arquivos JavaScript modificados: aprovado;
- `npm audit` no backend, frontend e raiz: sem vulnerabilidades reportadas.

## Próximas etapas recomendadas

1. Criar autenticação administrativa.
2. Definir e implementar o modelo de usuários administradores.
3. Criar modelos Prisma para projetos, imagens de projetos e imagens gerais.
4. Implementar CRUD administrativo de projetos.
5. Implementar upload local com validação de extensão, MIME type, tamanho e nome seguro.
6. Criar uma interface de armazenamento substituível para futura integração externa.
7. Implementar ordenação, imagem de capa e visibilidade.
8. Criar rotas públicas que retornem apenas projetos e imagens visíveis.
9. Criar listagem administrativa de contatos com autenticação.
10. Desenvolver o painel administrativo e seus testes.
11. Preparar a migração para PostgreSQL e armazenamento externo.

## Regras de segurança para as próximas tarefas

- Nunca armazenar senha em texto puro; usar hash forte e verificação segura.
- Não expor contatos, usuários, imagens ocultas ou dados administrativos em rotas públicas.
- Validar todos os payloads no backend, mesmo que o frontend também valide.
- Não confiar no nome, extensão ou MIME type enviado pelo navegador para salvar uploads.
- Impor tamanho máximo, formatos permitidos e limites de quantidade de imagens.
- Não aceitar caminhos de arquivo enviados pelo usuário.
- Usar identificadores de armazenamento gerados pelo servidor.
- Restringir CORS aos ambientes autorizados.
- Adicionar rate limit ao login, upload e demais endpoints sensíveis.
- Não registrar senhas, tokens ou dados completos de contato nos logs.
- Nunca executar `db push` em produção; usar migrations versionadas e `db:deploy`.

## Atualização — painel administrativo local

Data: 03/08/2026

O plano local foi implementado. PostgreSQL, deploy, HTTPS, backups e armazenamento externo permanecem fora do escopo atual.

### Autenticação

Foram adicionados os modelos `AdminUser` e `Session`, seed idempotente e os endpoints:

```text
POST /api/admin/auth/login
POST /api/admin/auth/logout
GET  /api/admin/auth/me
```

O primeiro administrador é criado com `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `ADMIN_NAME` no `.env`. A senha usa Argon2id; a sessão usa cookie HttpOnly e registro persistido com token armazenado em hash.

### Projetos e imagens

Foram adicionados `Project`, `ProjectImage` e `SiteImage`, com migration em:

```text
backend/prisma/migrations/20260803161336_add_admin_projects_and_images/
```

O CRUD administrativo cobre criação, edição, visibilidade, exclusão definitiva, upload, descrições, capa e ordenação. Projetos iniciam ocultos.

### Armazenamento local

As imagens ficam em `backend/uploads/`, que é ignorado pelo Git. São aceitos JPG e PNG até 25 MB, com limite padrão de 20 imagens por projeto. O conteúdo binário, extensão e MIME type são validados. Os arquivos são acessados por endpoints de mídia que respeitam a visibilidade.

### Rotas públicas

```text
GET /api/projects
GET /api/projects/:slug
GET /api/site-images
GET /api/site-images/:key
```

As respostas públicas retornam somente conteúdo visível e não expõem `storageKey`.

### Painel local

O painel está disponível em `frontend/admin.html` e, durante o desenvolvimento, em:

```text
http://localhost:5173/admin.html
```

Ele permite login, criação e edição de projetos, publicação/ocultação, exclusão, upload, descrições, capa, ordenação e gerenciamento das chaves `home.hero`, `sobre.empresa` e `contato.banner`.

### Validações realizadas

- migrations e seed executados;
- login válido e inválido;
- proteção de rotas administrativas;
- criação, upload de duas imagens, ordenação, capa e descrição;
- bloqueio público de projeto e mídia ocultos;
- publicação e consulta pública;
- rejeição de imagem com MIME/extensão incompatíveis;
- cadastro e remoção de imagem geral;
- exclusão definitiva e remoção dos arquivos;
- build do frontend com `index.html` e `admin.html`;
- fluxo visual de login e criação de projeto no navegador local;
- `npm audit` sem vulnerabilidades.

Os registros artificiais dos testes foram removidos. O banco local mantém o administrador seed e os contatos existentes anteriormente. A administração de contatos continua planejada para uma etapa posterior.

## Estado de Git

As alterações desta etapa estão no working tree da branch de desenvolvimento atual. Nenhum commit, push ou pull foi executado automaticamente. O próximo commit deve incluir o schema, a migration, o código da API, os ajustes de dependências e este arquivo de contexto.

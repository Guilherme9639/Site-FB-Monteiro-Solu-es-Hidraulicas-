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

### Imagens gerais do site — estado atual

Foi feita uma verificação no frontend público atual (`frontend/index.html` e `frontend/src/main.js`). Não foram encontradas referências às chaves `home.hero`, `sobre.empresa` ou `contato.banner`; a landing page ainda utiliza logos estáticos. Portanto, as descrições abaixo são posições reservadas para a futura integração dinâmica, e não usos já confirmados:

| Chave | Título amigável no painel | Localização documentada |
| --- | --- | --- |
| `home.hero` | Banner principal da página inicial | Topo da página inicial; consumo público ainda não implementado |
| `sobre.empresa` | Imagem institucional da empresa | Seção Sobre; consumo público ainda não implementado |
| `contato.banner` | Banner da área de contato | Área de contato; consumo público ainda não implementado |

Cada cartão administrativo exibe o título amigável, a localização documentada, a chave técnica em segundo plano, preview da imagem atual ou placeholder, descrição, nome do arquivo e data de atualização quando houver. O `storageKey` não é exposto.

O botão unificado `Salvar alterações` permite adicionar uma imagem, substituir a imagem existente ou alterar somente a descrição. Quando não há alterações, nenhuma requisição é enviada. A seleção de arquivo usa controle estilizado e exibe o nome do arquivo escolhido. A remoção exige confirmação e atualiza os cartões sem recarregar a página inteira. Cada cartão mantém seu próprio estado de carregamento e erro, preservando os dados digitados quando uma requisição falha.

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

## Atualizacao — carrossel “Nosso trabalho”

Data: 10/08/2026

A secao publica “Nosso trabalho”, que anteriormente utilizava automaticamente
`projects[0]`, agora possui configuracao propria e nao depende mais da ordem de
cadastro dos projetos.

### Modelos adicionados

- `WorkCarouselConfig`: configuracao unica do carrossel, com `mode` (`CUSTOM` ou
  `PROJECT`) e referencia opcional ao projeto selecionado.
- `WorkCarouselImage`: imagens personalizadas, com descricao, ordem, visibilidade
  e metadados de armazenamento.

As imagens personalizadas nao sao apagadas ao alternar para o modo por projeto.
A relacao com `Project` usa `SetNull`; excluir definitivamente o projeto
selecionado nao deixa referencia quebrada. Projetos ocultos deixam de ser usados
no endpoint publico e nao podem ser selecionados pelo painel.

### Rotas

```text
GET    /api/admin/work-carousel
PATCH  /api/admin/work-carousel
POST   /api/admin/work-carousel/images
PATCH  /api/admin/work-carousel/images/:imageId
DELETE /api/admin/work-carousel/images/:imageId
PATCH  /api/admin/work-carousel/images/order
GET    /api/work-carousel
GET    /api/media/work-carousel/:imageId
```

As rotas administrativas exigem autenticacao. O limite de imagens personalizadas
usa `MAX_IMAGES_PER_WORK_CAROUSEL`, com 20 como padrao, e reaproveita as
validacoes de JPG/PNG, assinatura binaria, tamanho e armazenamento local seguro.

O endpoint publico resolve o modo ativo, retorna apenas imagens visiveis e nao
expoe `storageKey`, caminhos internos ou dados administrativos. A pagina
`frontend/sobre.html` consome essa rota preservando o layout e o comportamento do
carrossel.

### Painel

`frontend/admin.html` ganhou a secao “Carrossel Nosso trabalho”, com modo
personalizado, upload multiplo, preview, descricao, remocao, ordenacao e modal
interno para selecionar um unico projeto publicado. Cancelar o modal nao altera
a configuracao.

### Validacoes desta etapa

- `prisma validate`: aprovado;
- migration `20260810191234_add_work_carousel`: criada e aplicada;
- `prisma generate`: aprovado;
- endpoint publico inicial: `CUSTOM` com lista vazia;
- rota administrativa sem sessao: `401`;
- rota administrativa autenticada: configuracao carregada;
- `node --check` dos arquivos JavaScript alterados: aprovado;
- build do frontend com `index.html`, `sobre.html` e `admin.html`: aprovado.

### Refinamentos posteriores

- o upload do modo `CUSTOM` agora começa automaticamente no evento de seleção
  de arquivos, sem botão adicional;
- os controles exibidos no painel acompanham imediatamente o modo selecionado,
  mantendo apenas o bloco `CUSTOM` ou `PROJECT` visível;
- a regra CSS dos blocos do carrossel foi corrigida para respeitar o atributo
  `hidden`; a regra de layout anterior podia sobrescrever a ocultação nativa e
  manter os dois blocos visíveis;
- foram corrigidas strings com mojibake em português brasileiro no painel e nas
  mensagens da API. Os documentos HTML já utilizavam `<meta charset="UTF-8">`;
- a causa das imagens quebradas no modo `PROJECT` era o uso incorreto do
  endpoint `/api/media/work-carousel/:id` para registros que pertencem a
  `ProjectImage`. O endpoint público agora retorna `/api/media/projects/:id`
  para imagens de projetos e mantém `/api/media/work-carousel/:id` para imagens
  personalizadas;
- a validação de visibilidade continua sendo feita no backend e o frontend não
  recebe caminhos físicos nem `storageKey`.

Esses ajustes preservam a alternância entre os modos e as imagens personalizadas
continuam armazenadas quando o modo `PROJECT` é escolhido.

### Validações do refinamento

- fluxo HTTP do modo `PROJECT` testado com projeto publicado e imagens reais;
- URLs retornadas verificadas como `/api/media/projects/:id`;
- primeira imagem do projeto respondendo HTTP 200;
- estado do carrossel restaurado para `CUSTOM` após o teste;
- estrutura do painel verificada no navegador: seletor de arquivos presente,
  botão redundante de upload ausente e `charset` definido como `UTF-8`;
- regra visual verificada no DOM: os dois blocos iniciam com `hidden` e o
  estilo computado é `display: none` enquanto inativos;
- `node --check`, `prisma validate`, `prisma generate`, build do frontend e
  `npm audit --audit-level=high` aprovados.

## Atualizacao — reorganizacao do painel de projetos

Data: 10/08/2026

O painel administrativo passou a iniciar pela lista de projetos em cards, com
capa, nome e status. A edicao detalhada de titulo, descricao, visibilidade e
imagens ocorre somente depois que um projeto e selecionado, mantendo um projeto
por vez na tela.

A criacao foi removida da visao principal e passou a utilizar o modal `Criar
novo projeto`. O modal mantem titulo e descricao e adiciona a opcao de criar o
projeto inicialmente publicado/visivel ou oculto. O backend ja existente para
`isVisible` foi reutilizado; nao houve alteracao de schema ou migration nesta
etapa.

O upload de imagens do projeto agora inicia automaticamente no evento de
selecao, sem o botao adicional `Adicionar imagens`. O seletor usa o mesmo
padrao visual de `Imagens gerais do site`, com label estilizado, input oculto e
nome dos arquivos selecionados.

### Validacoes desta etapa

- `node --check frontend/src/admin.js`: aprovado;
- build do frontend com `admin.html`: aprovado;
- estrutura do modal de criacao e da lista de projetos verificada no DOM;
- editor de projeto inicia oculto e e aberto somente apos selecionar um card;
- seletores de arquivo utilizam a classe visual compartilhada;
- nenhuma alteracao de backend, Prisma ou migration foi necessaria.

## Estado de Git

As alterações desta etapa estão no working tree da branch de desenvolvimento atual. Nenhum commit, push ou pull foi executado automaticamente. O próximo commit deve incluir o schema, a migration, o código da API, os ajustes de dependências e este arquivo de contexto.

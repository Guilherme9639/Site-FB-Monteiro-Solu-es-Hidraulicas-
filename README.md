# FB Monteiro Soluções Hidráulicas

Site institucional desenvolvido para fortalecer a presença digital da **FB Monteiro Soluções Hidráulicas**, apresentar seus serviços e facilitar o contato com potenciais clientes.

## Objetivo do projeto

Criar uma presença online clara e confiável para a empresa, permitindo que visitantes conheçam os serviços oferecidos, vejam trabalhos realizados e solicitem orçamentos.

## Tecnologias

- HTML
- CSS
- JavaScript
- Git e GitHub

## Estrutura atual

- `frontend/index.html`: página inicial, apresentação e carrossel de obras em destaque.
- `frontend/sobre.html`: apresentação profissional do proprietário e seção "Nosso trabalho".
- `frontend/contato.html`: formulário de contato, como alternativa ao atendimento direto pelo WhatsApp.
- `frontend/admin.html`: painel administrativo para autenticação, projetos e imagens.
- `backend/`: API Express, autenticação, Prisma, banco SQLite, projetos, imagens e contatos.
- `docs/CONTEUDO_INSTITUCIONAL.md`: textos institucionais aprovados e conteúdo público da empresa.

## Funcionalidades

- Carrossel da obra publicada mais recente na página inicial.
- Troca automática de fotos a cada 5 segundos, com navegação manual.
- Página Sobre com trajetória profissional e especialidade em kits hidráulicos.
- Cadastro, edição, ordenação, capa, visibilidade e upload de imagens pelo painel.
- Formulário de contato com validação e gravação no banco de dados.
- Atendimento direto pelo WhatsApp como principal canal de contato.
- Layout responsivo para computadores e celulares.

## Desenvolvimento

O carrossel publico da secao “Nosso trabalho” e resolvido pela API
`GET /api/work-carousel`. O painel permite selecionar imagens personalizadas ou
um projeto publicado; a pagina Sobre nao usa mais automaticamente o primeiro
projeto cadastrado.

O projeto utiliza um fluxo de trabalho com branches e pull requests para organizar as entregas e registrar a evolução do site.

## Como executar localmente

```bash
git clone https://github.com/Guilherme9639/Site-FB-Monteiro-Solu-es-Hidraulicas-.git
```

Instale as dependências na raiz do projeto:

```powershell
npm.cmd install
npm.cmd run install:all
```

Crie o ambiente do backend:

```powershell
Copy-Item backend\.env.example backend\.env
npm.cmd run db:generate --prefix backend
npm.cmd run db:deploy --prefix backend
npm.cmd run db:seed --prefix backend
```

Defina uma senha administrativa em `backend/.env` antes de executar o seed. Depois, inicie frontend e backend:

```powershell
npm.cmd run dev
```

Endereços locais:

| Serviço | Endereço |
| --- | --- |
| Página inicial | <http://localhost:5173/> |
| Sobre | <http://localhost:5173/sobre.html> |
| Contato | <http://localhost:5173/contato.html> |
| Painel administrativo | <http://localhost:5173/admin.html> |
| Saúde da API | <http://localhost:3000/api/health> |

## Próximas melhorias

- Substituir textos genéricos por informações institucionais adicionais aprovadas.
- Revisar acessibilidade, SEO e desempenho das imagens.
- Adicionar administração de contatos no painel.
- Preparar publicação online e migração futura para PostgreSQL e armazenamento externo.

## Autor

**Guilherme de Almeida Cardozo**

Projeto desenvolvido como experiência prática de desenvolvimento web e entrega de uma solução para uma empresa real.

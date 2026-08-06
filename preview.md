# Plano de continuidade — FB Monteiro Soluções Hidráulicas

**Data da revisão:** 04/08/2026  
**Repositório:** `Guilherme9639/Site-FB-Monteiro-Solu-es-Hidraulicas-`  
**Branch revisada:** `main`

## 1. Objetivo deste documento

Este documento registra o estado atual do projeto, as pendências encontradas e
a ordem recomendada para continuar o desenvolvimento. Ele também serve como
base para dividir tarefas entre os colaboradores e acompanhar a conclusão de
cada etapa.

## 2. Objetivo do projeto

Construir um site institucional para a FB Monteiro Soluções Hidráulicas que:

- apresente a empresa e seus diferenciais;
- exponha serviços e obras realizadas;
- transmita profissionalismo e confiança;
- permita solicitar orçamentos pelo site;
- direcione clientes para o WhatsApp;
- registre os contatos em banco de dados;
- disponibilize futuramente um painel administrativo.

## 3. Tecnologias atuais

### Frontend

- HTML semântico;
- CSS responsivo;
- JavaScript;
- Vite.

### Backend

- Node.js;
- Express;
- API REST;
- armazenamento temporário em memória.

### Ferramentas de desenvolvimento

- Git e GitHub;
- Visual Studio Code;
- npm;
- branches e Pull Requests.

### Tecnologias planejadas

- PostgreSQL;
- Prisma ORM;
- autenticação administrativa;
- hospedagem do frontend, backend e banco de dados.

## 4. Estado atual

| Área | Situação |
| --- | --- |
| Estrutura do frontend e backend | Concluída |
| Página inicial responsiva | Concluída |
| Identidade visual | Concluída |
| Integração por link com WhatsApp | Concluída |
| Formulário de orçamento | Concluído |
| API de contatos | Funcional localmente |
| Persistência em banco de dados | Pendente |
| Seção Sobre | Pendente |
| Carrossel de obras | Pendente na `main` |
| Página completa de obras | Pendente |
| Painel administrativo | Pendente |
| Hospedagem e domínio | Pendente |
| Documentação técnica completa | Pendente |

## 5. Funcionalidades concluídas

### 5.1 Estrutura do projeto

O projeto está separado em duas aplicações:

```text
backend/   API e regras do servidor
frontend/  interface acessada pelo cliente
```

A raiz possui scripts para instalar e executar as duas partes em conjunto.

### 5.2 Página inicial

A página inicial possui:

- cabeçalho com logomarca;
- menu de navegação;
- chamada principal;
- botões para solicitar orçamento;
- identidade visual em azul-escuro, azul, branco e laranja;
- layout adaptado para computadores, tablets e celulares.

### 5.3 WhatsApp

Os botões utilizam um link para o número comercial da empresa. Essa integração
abre uma conversa no WhatsApp, mas ainda não utiliza a API oficial para
automação de mensagens.

### 5.4 Formulário de contato

O formulário captura:

- nome;
- telefone ou WhatsApp;
- descrição do serviço solicitado.

O JavaScript utiliza `FormData`, converte os campos em objeto, transforma o
objeto em JSON e envia uma requisição `POST` ao backend.

### 5.5 API de contatos

Endpoints atuais:

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| `GET` | `/api/health` | Verificar se a API está funcionando |
| `POST` | `/api/contatos` | Cadastrar uma solicitação |
| `GET` | `/api/contatos` | Listar solicitações cadastradas |

Cada contato recebe:

- identificador único;
- nome;
- telefone;
- mensagem;
- status `pending`;
- data e hora de criação.

## 6. Pendências encontradas

### 6.1 Obras em destaque não estão na `main`

As imagens da Obra Ricam e o array `featuredProjects`, que chegaram a ser
preparados durante o desenvolvimento, não aparecem na versão atual da `main`.

Na versão atual existem apenas as imagens das logomarcas:

```text
frontend/public/images/logo-fb-monteiro-horizontal.png
frontend/public/images/logo-fb-monteiro.png
```

Será necessário adicionar novamente as imagens das obras em uma nova branch.

### 6.2 Link Sobre sem destino

O menu possui um link para `#sobre`, mas ainda não existe uma seção com esse
identificador. O botão pode alterar a URL sem levar o visitante ao conteúdo
esperado.

### 6.3 Armazenamento temporário

Os contatos ficam armazenados em um array no backend. Eles são apagados sempre
que o servidor é reiniciado.

### 6.4 Listagem pública

A rota `GET /api/contatos` ainda não exige autenticação. Ela deverá ser
protegida antes da publicação do site.

### 6.5 Endereço local da API

O frontend utiliza endereços como:

```javascript
fetch("http://localhost:3000/api/contatos");
```

Esse endereço funciona somente no computador de desenvolvimento. Antes da
publicação, deverá ser substituído por uma variável de ambiente.

### 6.6 Conteúdo incompleto

Ainda faltam informações oficiais fornecidas ou validadas pelo proprietário:

- história da empresa;
- tempo de atuação;
- serviços oferecidos;
- cidades e regiões atendidas;
- diferenciais;
- horário de atendimento;
- fotos e descrições autorizadas das obras.

### 6.7 Rodapé provisório

O rodapé contém somente o nome da empresa e ainda precisa de estrutura,
contatos, navegação e estilização.

### 6.8 Documentação inicial desatualizada

O `README.md` ainda descreve somente a ideia inicial e não representa as
funcionalidades, comandos e arquitetura já implementados.

## 7. Próximas etapas por prioridade

## Etapa 1 — Organização do trabalho em equipe

### Objetivo

Garantir que cada integrante trabalhe a partir da versão mais recente e em
arquivos ou tarefas bem definidos.

### Procedimento inicial

Nos dois computadores:

```bash
git switch main
git pull origin main
```

Criar uma branch por tarefa:

```bash
git switch -c tipo/nome-da-tarefa
```

Exemplos:

```text
feature/carrossel-obras
docs/documentacao-projeto
feature/secao-sobre
feature/banco-contatos
```

Publicar a branch pela primeira vez:

```bash
git push -u origin nome-da-branch
```

### Critério de conclusão

- cada colaborador possui uma branch remota;
- nenhuma tarefa é desenvolvida diretamente na `main`;
- cada branch possui escopo e responsável definidos;
- alterações entram na `main` por Pull Request.

## Etapa 2 — Obras em destaque

### Objetivo

Substituir a logomarca grande da área principal por obras importantes da
empresa, preservando o texto institucional do lado esquerdo.

### Escopo recomendado

- no máximo três obras em destaque;
- uma foto de capa por obra na página inicial;
- quatro ou cinco fotos na galeria de cada obra;
- nome, local e breve descrição;
- controles anterior e próximo;
- indicadores de posição;
- troca automática entre obras;
- pausa ou controle para evitar movimento excessivo;
- funcionamento em dispositivos móveis.

### Estrutura sugerida das imagens

```text
frontend/public/images/obras/
├── ricam/
│   ├── capa.jpeg
│   ├── 1.jpeg
│   ├── 2.jpeg
│   └── 3.jpeg
├── vale/
└── terceira-obra/
```

### Ordem de implementação

1. Criar uma nova branch `feature/carrossel-obras`.
2. Adicionar novamente as fotos da Obra Ricam.
3. Criar ou recuperar o array `featuredProjects`.
4. Confirmar caminhos e extensões das imagens.
5. Criar o HTML estático do primeiro projeto.
6. Criar os estilos do componente.
7. Fazer o JavaScript renderizar o primeiro projeto.
8. Adicionar controles anterior e próximo.
9. Adicionar rotação automática.
10. Testar desktop, tablet e celular.

### Critério de conclusão

- imagens carregam sem erro;
- título e descrição correspondem à obra exibida;
- controles funcionam;
- rotação automática não impede a navegação manual;
- componente não causa rolagem horizontal;
- imagens possuem texto alternativo apropriado;
- formulário e WhatsApp continuam funcionando.

## Etapa 3 — Conteúdo institucional

### Objetivo

Criar conteúdo real e validado pelo proprietário.

### Entregas

- seção `#sobre`;
- apresentação da empresa;
- lista de serviços;
- região de atendimento;
- diferenciais;
- horário de atendimento;
- seção ou página de obras;
- rodapé completo.

### Organização recomendada

```text
Início
Sobre
Obras
Contato
```

A página inicial deve exibir somente as três obras principais. As demais devem
ficar em uma seção ou página específica de obras, não dentro do conteúdo
institucional da empresa.

### Critério de conclusão

- links do menu possuem destinos válidos;
- textos foram aprovados pelo proprietário;
- fotografias possuem autorização de publicação;
- contatos e horários estão corretos;
- rodapé está responsivo.

## Etapa 4 — Banco de dados PostgreSQL

### Objetivo

Substituir o armazenamento temporário por persistência real.

### Entregas

- PostgreSQL configurado;
- Prisma instalado;
- conexão definida em `.env`;
- modelo `Contact` criado;
- migração inicial executada;
- controller utilizando o banco;
- status dos contatos padronizados;
- dados preservados após reiniciar o backend.

### Status sugeridos

```text
PENDING
CONTACTED
FINISHED
```

### Critério de conclusão

- contato continua disponível após reiniciar o servidor;
- erros do banco recebem resposta controlada;
- arquivo `.env` não é enviado ao GitHub;
- `.env.example` documenta as variáveis necessárias.

## Etapa 5 — Painel administrativo

### Objetivo

Permitir que pessoas autorizadas acompanhem os pedidos de orçamento.

### Primeira versão

- tela de login;
- autenticação;
- listagem de contatos;
- consulta dos detalhes;
- atualização do status;
- exclusão controlada;
- proteção da rota `GET /api/contatos`.

### Evolução futura

- cadastro de obras;
- edição de título e descrição;
- seleção das três obras em destaque;
- upload e organização de fotografias.

### Critério de conclusão

- usuários não autenticados não acessam contatos;
- senhas não são armazenadas em texto puro;
- sessão ou token expira adequadamente;
- ações administrativas retornam mensagens claras.

## Etapa 6 — Preparação para produção

### Objetivo

Adaptar o projeto local para hospedagem pública.

### Pendências

- criar `VITE_API_URL` no frontend;
- configurar a URL pública do backend;
- configurar CORS para o domínio real;
- validar tamanho e formato dos campos;
- limitar requisições repetidas;
- implementar proteção contra spam;
- otimizar imagens;
- adicionar informações de privacidade;
- revisar metadados e SEO;
- adicionar favicon;
- testar acessibilidade;
- executar build de produção.

### Critério de conclusão

- nenhuma URL de produção depende de `localhost`;
- frontend e backend comunicam-se na hospedagem;
- formulário funciona pelo domínio real;
- site utiliza HTTPS;
- erros não expõem detalhes internos;
- imagens carregam em tempo aceitável.

## Etapa 7 — Hospedagem

### Estrutura sugerida

| Componente | Possível plataforma |
| --- | --- |
| Frontend | Vercel |
| Backend Node.js | Railway ou serviço equivalente |
| PostgreSQL | Railway, Supabase ou serviço equivalente |
| Domínio `.com.br` | Registro.br |

Os preços e limites deverão ser consultados novamente no momento da
contratação, pois podem mudar.

## Etapa 8 — Testes e manutenção

### Testes importantes

- formulário válido e inválido;
- API disponível e indisponível;
- WhatsApp;
- menu;
- carrossel;
- navegação por teclado;
- celulares com telas menores;
- banco indisponível;
- acesso não autorizado ao painel.

### Melhorias técnicas futuras

- ESLint;
- Prettier;
- testes automatizados;
- GitHub Actions;
- logs do backend;
- monitoramento;
- backups do banco.

## 8. Divisão inicial recomendada

| Responsável | Tarefa | Arquivos principais |
| --- | --- | --- |
| Guilherme | Carrossel de obras | `index.html`, `main.js`, `styles.css`, imagens |
| Sócio | Documentação | `README.md`, `docs/GUIA_DESENVOLVIMENTO.md` |
| Depois | Banco de dados | Arquivos do `backend` e pasta `prisma` |
| Depois | Página completa de obras | Página e arquivos próprios |

Essa divisão evita que os dois alterem simultaneamente os mesmos arquivos.

## 9. Fluxo de entrega de uma tarefa

Antes de começar:

```bash
git switch main
git pull origin main
git switch nome-da-branch
git merge main
```

Depois de implementar e testar:

```bash
git status
git add .
git commit -m "Descrição objetiva da alteração"
git push
```

No GitHub:

1. abrir Pull Request para `main`;
2. solicitar revisão do outro integrante;
3. corrigir eventuais problemas;
4. fazer merge;
5. atualizar a `main` nos dois computadores.

## 10. Ordem resumida recomendada

1. Organizar branches e responsabilidades.
2. Recuperar imagens e concluir o carrossel.
3. Criar documentação detalhada.
4. Receber e inserir o conteúdo do proprietário.
5. Criar seção Sobre e página de obras.
6. Configurar PostgreSQL e Prisma.
7. Persistir contatos.
8. Criar autenticação e painel administrativo.
9. Preparar segurança, privacidade, SEO e acessibilidade.
10. Publicar frontend, backend e banco.
11. Configurar domínio.
12. Testar a versão pública.

## 11. Próxima ação recomendada

### Guilherme

```bash
git switch main
git pull origin main
git switch -c feature/carrossel-obras
```

Depois, adicionar novamente as fotos da Obra Ricam e criar inicialmente apenas
a apresentação estática da primeira obra.

### Sócio

```bash
git switch main
git pull origin main
git switch -c docs/documentacao-projeto
git push -u origin docs/documentacao-projeto
```

Depois, atualizar o `README.md` e começar o
`docs/GUIA_DESENVOLVIMENTO.md` com o histórico já concluído.

## 12. Regra para atualização deste plano

Ao concluir cada etapa:

1. alterar sua situação de `Pendente` para `Concluída`;
2. registrar arquivos modificados;
3. explicar a lógica implementada;
4. registrar como testar;
5. informar limitações conhecidas;
6. registrar o commit ou Pull Request correspondente;
7. definir a próxima etapa.


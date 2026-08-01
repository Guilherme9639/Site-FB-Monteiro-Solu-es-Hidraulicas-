# Configuração do ambiente de desenvolvimento

Este documento apresenta as ferramentas e configurações necessárias para
trabalhar no projeto **FB Monteiro Soluções Hidráulicas**.

## Ferramentas obrigatórias

### 1. Visual Studio Code

Editor utilizado para desenvolver o frontend e o backend do projeto.

- Download: [Visual Studio Code](https://code.visualstudio.com/download)

### 2. Node.js

O Node.js é necessário para executar o backend, o Vite e as demais ferramentas
JavaScript do projeto. Utilize a versão **24 LTS**. O `npm` já está incluído na
instalação do Node.js.

- Download: [Node.js](https://nodejs.org/en/download)

### 3. Git

O Git será utilizado para baixar o projeto, criar versões e enviar alterações
ao GitHub.

- Download: [Git](https://git-scm.com/downloads)

### 4. Conta no GitHub

Cada integrante deverá possuir uma conta no GitHub e ser adicionado como
colaborador do repositório.

No GitHub, o proprietário deve acessar:

```text
Settings → Collaborators → Add people
```

## Extensões recomendadas para o VS Code

- **Prettier:** formatação automática do código.
- **ESLint:** identificação de possíveis problemas no JavaScript.
- **GitLens:** facilita a visualização do histórico e das alterações do Git.
- **Portuguese Language Pack:** tradução da interface do VS Code para português.

## Ferramentas opcionais

- **GitHub Desktop:** interface visual para utilizar o Git.
- **Postman ou Insomnia:** testes das rotas e requisições do backend.
- **DBeaver:** visualização e administração do banco PostgreSQL.
- **Trello:** organização e acompanhamento das tarefas do projeto.

> Não é necessário instalar Express, Vite ou outras bibliotecas do projeto
> manualmente. O `npm` instalará essas dependências automaticamente.

## Verificação das instalações

Após instalar o Node.js e o Git, abra o terminal e execute:

```bash
node --version
npm --version
git --version
```

Os três comandos devem exibir as versões instaladas sem apresentar erros.

## Configuração inicial do Git

Caso seja a primeira utilização do Git no computador, configure o nome e o
e-mail associados à conta do GitHub:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

Para conferir a configuração:

```bash
git config --global --list
```

## Baixando o projeto

No terminal, acesse a pasta onde deseja armazenar o projeto e execute:

```bash
git clone https://github.com/Guilherme9639/Site-FB-Monteiro-Solu-es-Hidraulicas-.git
cd Site-FB-Monteiro-Solu-es-Hidraulicas-
```

## Instalando as dependências

Dentro da pasta principal do projeto, execute:

```bash
npm install
npm run install:all
```

O primeiro comando instala as ferramentas da raiz do projeto. O segundo instala
as dependências do frontend e do backend.

## Executando o projeto

Para iniciar o frontend e o backend ao mesmo tempo:

```bash
npm run dev
```

Depois, acesse os seguintes endereços:

| Serviço | Endereço |
| --- | --- |
| Frontend | <http://localhost:5173> |
| Teste do backend | <http://localhost:3000/api/health> |

Para encerrar os servidores, pressione `Ctrl + C` no terminal.

## Fluxo básico de colaboração

Antes de iniciar uma tarefa, atualize o projeto local:

```bash
git switch main
git pull origin main
```

Crie uma branch com um nome relacionado à tarefa:

```bash
git switch -c nome-da-tarefa
```

Após concluir e testar a alteração:

```bash
git status
git add .
git commit -m "Descrição objetiva da alteração"
git push -u origin nome-da-tarefa
```

Depois do envio, abra um **Pull Request** no GitHub para revisar e integrar a
alteração à branch `main`.

## Boas práticas da equipe

- Execute `git pull` antes de iniciar novas alterações.
- Utilize uma branch separada para cada tarefa.
- Evite trabalhar simultaneamente no mesmo arquivo sem combinar previamente.
- Escreva mensagens de commit curtas e objetivas.
- Teste o projeto antes de enviar as alterações.
- Nunca envie senhas, chaves ou o arquivo `.env` para o GitHub.
- Utilize a mesma versão LTS do Node.js em todos os computadores.


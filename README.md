# SampleApi

## Descrição

SampleApi é uma API backend para cadastro de usuários, construída com foco em separação de responsabilidades e aplicação de conceitos de arquitetura em camadas.

A API resolve o fluxo de criação de usuários com validação de dados, verificação de e-mail duplicado, armazenamento seguro da senha com hash e seleção de canal preferencial de marketing. Pode ser útil para desenvolvedores que desejam estudar uma API Node.js com Fastify, PostgreSQL, Drizzle ORM, testes automatizados e organização inspirada em princípios SOLID.

## Funcionalidades

- Cadastro de usuários.
- Validação do corpo da requisição com Zod.
- Validação de idade mínima e máxima para cadastro.
- Validação de telefone com prefixo brasileiro `+55`.
- Validação de e-mail em formato válido.
- Validação de confirmação de senha.
- Bloqueio de cadastro com e-mail já existente.
- Armazenamento de senha com hash usando `bcrypt`.
- Persistência de usuários em banco PostgreSQL usando Drizzle ORM.
- Seleção de canal preferencial de marketing entre `email`, `sms`, `push` e `whatsapp`.
- Simulação de envio de notificação por estratégia de canal.
- Documentação interativa via Swagger UI em `/docs`.
- Testes automatizados para o endpoint de criação de usuário.

### Operações CRUD

Atualmente, o projeto implementa apenas a operação de criação para a entidade `User`:

| Entidade | Criar                  | Listar           | Atualizar        | Remover          |
| -------- | ---------------------- | ---------------- | ---------------- | ---------------- |
| Usuário  | Sim, via `POST /users` | Não implementado | Não implementado | Não implementado |

## Tecnologias utilizadas

- TypeScript
- Node.js
- Fastify
- Zod
- fastify-type-provider-zod
- @fastify/swagger
- @fastify/swagger-ui
- PostgreSQL
- Drizzle ORM
- drizzle-kit
- bcrypt
- dotenv
- pg
- Vitest
- Supertest
- ESLint
- Docker Compose
- pnpm
- tsx

## Arquitetura e organização

O projeto está organizado em camadas, separando regras de negócio, entrada HTTP e recursos externos.

```text
src/
  application/
    entities/
    errors/
    factories/
    usecases/
  drivers/
  resources/
    daos/
    db/
    notifications/
    repositories/
  index.ts
```

- `src/index.ts`: ponto de entrada da aplicação. Cria a instância da API e inicia o servidor na porta `4949`.
- `src/drivers/`: camada de entrada da aplicação. Contém a configuração do Fastify, Swagger, validação de schemas e rotas HTTP.
- `src/application/entities/`: definição da entidade de domínio `User`.
- `src/application/usecases/`: casos de uso da aplicação. Atualmente contém o fluxo de criação de usuário.
- `src/application/errors/`: erros específicos de regra de negócio.
- `src/application/factories/`: fábrica responsável por selecionar a estratégia de notificação conforme o canal de marketing.
- `src/resources/repositories/`: contratos e implementação de repositório para persistência de usuários.
- `src/resources/daos/`: implementação DAO com Drizzle ORM.
- `src/resources/db/`: cliente de banco de dados e definição do schema Drizzle.
- `src/resources/notifications/`: estratégias de envio de notificação para `email`, `sms`, `push` e `whatsapp`.
- `src/drivers/app.test.ts`: testes automatizados do endpoint `POST /users`.

## Endpoints da API

A API inicia na porta `4949`. A documentação Swagger UI fica disponível em:

```text
GET http://localhost:4949/docs
```

### Tabela de endpoints

| Método HTTP | Rota     | Descrição             | Parâmetros/corpo da requisição                                                                                          | Possíveis respostas                                                           |
| ----------- | -------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `POST`      | `/users` | Cria um novo usuário. | Corpo JSON com `name`, `age`, `phoneNumber`, `email`, `password`, `passwordConfirmation` e `preferredMarketingChannel`. | `201 Created`, `400 Bad Request`, `409 Conflict`, `500 Internal Server Error` |

### POST `/users`

Cria um usuário no banco de dados. A senha é armazenada com hash e não é retornada na resposta.

#### Corpo da requisição

```json
{
  "name": "John Doe",
  "age": 20,
  "phoneNumber": "+5511999999999",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirmation": "password123",
  "preferredMarketingChannel": "email"
}
```

#### Regras de validação identificadas no código

- `name`: string obrigatória, sem espaços nas extremidades e com pelo menos 1 caractere.
- `age`: número inteiro obrigatório entre `18` e `100`.
- `phoneNumber`: string obrigatória, sem espaços nas extremidades e iniciada com `+55`.
- `email`: e-mail obrigatório em formato válido.
- `password`: string obrigatória com no mínimo 8 caracteres.
- `passwordConfirmation`: string obrigatória com no mínimo 8 caracteres.
- `preferredMarketingChannel`: valor obrigatório entre `email`, `sms`, `push` e `whatsapp`.

#### Resposta `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "age": 20,
  "phoneNumber": "+5511999999999",
  "email": "john@example.com",
  "preferredMarketingChannel": "email"
}
```

#### Resposta `400 Bad Request`

Quando a senha e a confirmação de senha são diferentes:

```json
{
  "error": "Passwords do not match"
}
```

Também pode ocorrer `400 Bad Request` quando o corpo da requisição não atende ao schema de validação definido com Zod.

#### Resposta `409 Conflict`

Quando já existe um usuário cadastrado com o mesmo e-mail:

```json
{
  "error": "Email já cadastrado!"
}
```

#### Resposta `500 Internal Server Error`

Quando ocorre erro interno durante a criação do usuário:

```json
{
  "error": "Erro ao criar usuário!"
}
```

## Como executar o projeto

### Pré-requisitos

- Node.js compatível com TypeScript e ES Modules.
- pnpm, conforme definido em `package.json`.
- Docker e Docker Compose, caso deseje subir o PostgreSQL via `docker-compose.yml`.
- Banco PostgreSQL disponível e configurado na variável `DATABASE_URL`.

### Clonar o repositório

```bash
git clone <url-do-repositorio>
cd SOLID-MASTERCLASS
```

### Instalar as dependências

```bash
pnpm install
```

### Configurar variáveis de ambiente

### Subir o banco com Docker Compose

O arquivo `docker-compose.yml` define um serviço PostgreSQL na porta `5432`.

```bash
docker compose up -d
```

### Estrutura esperada do banco

O projeto possui schema Drizzle em `src/resources/db/schema.ts`, mas não possui migrations versionadas nem script de migração no `package.json`. Antes de iniciar a API, o banco precisa ter a tabela `users` e o enum `marketing_channel` compatíveis com o schema do projeto.

Estrutura identificada no código:

```sql
CREATE TYPE marketing_channel AS ENUM ('email', 'sms', 'whatsapp', 'push');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  age integer NOT NULL,
  phone_number varchar(255) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  password varchar(255) NOT NULL,
  preferred_marketing_channel marketing_channel NOT NULL DEFAULT 'email'
);
```

### Iniciar a aplicação

```bash
pnpm run dev
```

Após iniciar, a API ficará disponível em:

```text
http://localhost:4949
```

E a documentação Swagger UI em:

```text
http://localhost:4949/docs
```

## Testes

O projeto possui testes automatizados com Vitest e Supertest no arquivo `src/drivers/app.test.ts`.

Os testes cobrem:

- Criação de usuário com sucesso.
- Retorno dos campos públicos do usuário sem expor a senha.
- Persistência do usuário no banco.
- Armazenamento de senha com hash.
- Canais de marketing aceitos: `email`, `sms`, `push` e `whatsapp`.
- Erro quando `password` e `passwordConfirmation` são diferentes.
- Erro quando o e-mail já está cadastrado.
- Erro interno em caso de violação de restrição de banco, como telefone duplicado.
- Validações de schema para campos ausentes ou inválidos.

Para executar:

```bash
pnpm run test
```

Observação: os testes acessam o banco configurado em `DATABASE_URL` e limpam a tabela `users` antes de cada caso de teste.

## Melhorias futuras

### Melhorias técnicas

- [ ] Adicionar migrations versionadas para criação e evolução do banco de dados.
- [ ] Adicionar scripts no `package.json` para gerar e aplicar migrations com Drizzle.
- [ ] Adicionar script de lint no `package.json`.
- [ ] Adicionar build de produção no `package.json`.
- [ ] Criar configuração de Docker para a aplicação, além do banco de dados.
- [ ] Adicionar pipeline de CI/CD para executar lint, testes e build automaticamente.
- [ ] Adicionar logs estruturados para facilitar observabilidade.

### Novas funcionalidades

- [ ] Implementar listagem de usuários.
- [ ] Implementar busca de usuário por ID.
- [ ] Implementar atualização de dados de usuário.
- [ ] Implementar remoção de usuário.
- [ ] Adicionar paginação, filtros e ordenação na listagem.
- [ ] Implementar envio real de notificações para os canais suportados.
- [ ] Adicionar endpoint de health check.

### Segurança e qualidade

- [ ] Implementar autenticação e autorização.
- [ ] Adicionar tratamento global de exceções.
- [ ] Padronizar respostas de erro para validações de schema.
- [ ] Adicionar validações mais específicas para telefone.
- [ ] Isolar ambiente de testes com banco dedicado.
- [ ] Aumentar a cobertura de testes para casos de repositório e caso de uso.
- [ ] Adicionar documentação OpenAPI mais detalhada com descrições e exemplos por campo.
- [ ] Configurar variáveis de ambiente por ambiente, como desenvolvimento, teste e produção.
- [ ] Evitar versionamento de arquivos `.env` com credenciais reais.

## Autor

- Nome: Fábio Enzo Araujo Barbosa
- LinkedIn: www.linkedin.com/in/fábio-enzo-araujo-barbosa-71855235b

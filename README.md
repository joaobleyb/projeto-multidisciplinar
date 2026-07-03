# EventHub

Plataforma web para organização e gerenciamento de eventos, com dois perfis de acesso — **Gestor** (cria e administra eventos) e **Cliente** (explora e se inscreve em eventos).

---

## Sobre o projeto

O EventHub permite que gestores criem, editem e acompanhem eventos (com foto, data, horário e status), enquanto clientes podem explorar a lista de eventos disponíveis, se inscrever e acompanhar suas inscrições em um dashboard próprio. A autenticação é feita por e-mail/senha com token JWT, e o cadastro permite escolher o tipo de conta (Gestor ou Cliente).

---

## Tecnologias

**Frontend**
- HTML5, CSS3 e JavaScript puro (sem framework)
- Fonte: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Google Fonts)

**Backend**
- Node.js + Express
- MySQL (`mysql2`)
- Autenticação via JWT (`jsonwebtoken`)
- Hash de senha com `bcryptjs`
- `cors`, `dotenv`

**Infraestrutura**
- Docker e Docker Compose (MySQL, backend, phpMyAdmin e frontend via Nginx)

**Testes**
- Jest, com mocks da camada de banco de dados para isolar a lógica dos controllers

---

## Estrutura do projeto

```
.
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   │   ├── autenticacao.js
│   │   │   ├── eventos.js
│   │   │   └── participantes.js
│   │   └── controllers/
│   │       ├── authController.js
│   │       ├── eventosController.js
│   │       └── participantesController.js
│   ├── testes/
│   │   ├── authController.test.js
│   │   ├── eventosController.test.js
│   │   └── relatorio_de_testes.md
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── index.html                     # Tela de login
│   ├── css/
│   │   ├── login.css
│   │   ├── dashboard_cliente.css
│   │   ├── dashboard_gestor.css
│   │   └── explorar_eventos.css
│   ├── js/
│   │   ├── telaLogin.js
│   │   ├── telaCadastro.js
│   │   ├── dashboard_cliente.js
│   │   ├── dashboard_gestor.js
│   │   └── explorar_eventos.js
│   └── pages/
│       ├── cadastro.html
│       ├── dashboard_gestor.html
│       ├── dashboard_cliente.html
│       └── explorar_eventos.html
├── banco/
│   └── init.sql                       # Schema + seed, executado pelo Docker
├── docker-compose.yml
└── .gitignore
```

---

## Como rodar o projeto

Pré-requisitos: [Docker](https://www.docker.com/) e Docker Compose instalados.

```bash
git clone https://github.com/joaobleyb/projeto-multidisciplinar
docker compose up -d
```

Isso sobe automaticamente:

| Serviço      | Porta local | Descrição                          |
|--------------|-------------|-------------------------------------|
| `frontend`   | `8081`      | Interface web (Nginx)               |
| `backend`    | `3000`      | API REST (Node/Express)             |
| `mysql`      | `3306`      | Banco de dados                      |
| `phpmyadmin` | `8080`      | Administração do banco via navegador |

Acesse a aplicação em **http://localhost:8081**.

O banco já é criado e populado com dois usuários de teste (senha `123123` para ambos):
- `jvbb2004@gmail.com` — perfil **Gestor**
- `jvbb20042@gmail.com` — perfil **Cliente**


## Variáveis de ambiente (backend)

| Variável         | Descrição                              |
|------------------|------------------------------------------|
| `DB_HOST`        | Host do MySQL                            |
| `DB_PORT`        | Porta do MySQL (padrão `3306`)           |
| `DB_USER`        | Usuário do banco                         |
| `DB_PASSWORD`    | Senha do banco                           |
| `DB_NAME`        | Nome do banco (`eventhub`)               |
| `PORT`           | Porta da API (padrão `3000`)             |
| `JWT_SECRET`     | Chave secreta para assinatura do token   |
| `JWT_EXPIRES_IN` | Validade do token (ex: `7d`)             |

---

## Principais rotas da API

| Método | Rota                                              | Descrição                                    |
|--------|----------------------------------------------------|-----------------------------------------------|
| POST   | `/api/auth/cadastrar`                              | Cria um novo usuário (gestor ou cliente)      |
| POST   | `/api/auth/login`                                  | Autentica e retorna token JWT                 |
| GET    | `/api/eventos`                                     | Lista todos os eventos                        |
| GET    | `/api/eventos/usuario/:usuarioId`                  | Lista eventos criados por um gestor           |
| POST   | `/api/eventos`                                     | Cria um evento                                |
| PUT    | `/api/eventos/:id`                                 | Edita um evento                               |
| DELETE | `/api/eventos/:id`                                 | Remove um evento                              |
| POST   | `/api/participantes`                               | Inscreve um cliente em um evento              |
| DELETE | `/api/participantes/:eventoId/usuario/:usuarioId`  | Cancela inscrição                             |
| GET    | `/api/participantes/usuario/:usuarioId`            | Lista eventos em que o usuário está inscrito  |
| GET    | `/api/participantes/evento/:eventoId`              | Lista participantes de um evento              |
| GET    | `/api/participantes/total/gestor/:usuarioId`       | Total de participantes de um gestor           |
| GET    | `/api/ping`                                        | Healthcheck da API                            |

---

## Testes
 
Os testes automatizados do EventHub cobrem o **backend**, validando as regras de negócio dos controllers de autenticação (`authController`) e de eventos (`eventosController`). Eles são escritos com **Jest** e usam **mocks** da camada de banco de dados (`conexaoDB`) — ou seja, simulam as respostas do MySQL em vez de se conectar a um banco real. Isso torna os testes rápidos, isolados e reprodutíveis: não é preciso ter o MySQL nem o Docker rodando para executá-los.
 
### Pré-requisitos
 
- **Node.js** instalado (recomendado: versão 20, mesma usada no `Dockerfile` do backend)
- Dependências do backend instaladas (o Jest está listado em `devDependencies` no `package.json`)

### Como rodar
 
```bash
cd backend
npm install   # instala as dependências, incluindo o Jest
npm test      # executa a suíte de testes
```
 
### O que é validado
 
- **Validação de entrada** — campos obrigatórios ausentes ou inválidos no cadastro e na criação de eventos
- **Fluxo de sucesso** — cadastro, login e criação de eventos com dados corretos
- **Conflitos de regra de negócio** — tentativa de cadastro com e-mail já existente
- **Falhas de infraestrutura** — comportamento da API quando a conexão com o banco falha (simulado via mock)
- **Consulta e exclusão de dados** — busca de eventos por usuário e remoção de eventos existentes
O relatório completo, com a lista de casos de teste e os resultados da última execução, está em [`backend/testes/relatorio_de_testes.md`](backend/testes/relatorio_de_testes.md).
 
---
 
## Padrão de código do frontend
 
O frontend segue um padrão de nomenclatura em português, definido em `frontend/index.html` (tela de login) e replicado nas demais páginas:
 
- **Classes**: `topbar`, `topbar-logo`, `container`, `login-area`, `form-area`, `senha-wrapper`, `forgot-password`, `rodape-termos`, `link-cadastro`, `imagem`, `imagem-overlay`
- **IDs**: `email`, `senha`, `frase`, `btnEntrar`, `btnCadastrar`, `imagemAleatoria`
Esse padrão deve ser mantido ao criar novas telas ou componentes no projeto.
 
---
 
## Licença
 
Este projeto é de uso acadêmico/educacional.
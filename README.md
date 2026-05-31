# EventHub

Plataforma web para criação, gestão e inscrição em eventos, com dois tipos de usuário: **Gestor** e **Cliente**.

---

## Tecnologias

**Frontend**
- HTML, CSS, JavaScript (Vanilla)
- Google Fonts — Plus Jakarta Sans

**Backend**
- Node.js + Express
- MySQL 8.0 (via Docker)
- JWT para autenticação
- bcryptjs para hash de senhas

**Infraestrutura**
- Docker + Docker Compose
- phpMyAdmin (interface do banco)

---

## Estrutura do Projeto

```
eventhub/
├── banco/
│   └── init.sql                  # Script de criação do banco
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── conexaoDB.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── eventosController.js
│   │   │   └── participantesController.js
│   │   ├── middlewares/
│   │   │   └── verificarToken.js
│   │   ├── routes/
│   │   │   ├── autenticacao.js
│   │   │   ├── eventos.js
│   │   │   └── participantes.js
│   │   └── server.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── css/
│   │   ├── login.css
│   │   ├── dashboard_gestor.css
│   │   ├── dashboard_cliente.css
│   │   └── explorar_eventos.css
│   ├── img/
│   ├── js/
│   │   ├── telaLogin.js
│   │   ├── telaCadastro.js
│   │   ├── dashboard_gestor.js
│   │   ├── dashboard_cliente.js
│   │   └── explorar_eventos.js
│   ├── pages/
│   │   ├── cadastro.html
│   │   ├── dashboard_gestor.html
│   │   ├── dashboard_cliente.html
│   │   └── explorar_eventos.html
│   └── index.html
├── docker-compose.yml
└── .gitignore
```

---

## Como Rodar

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados
- Node.js 20+ (caso queira rodar o backend fora do Docker)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/eventhub.git
cd eventhub
```

### 2. Configure as variáveis de ambiente

```bash
cp backend/.env.example backend/.env
```

Edite o `backend/.env` com seus valores (ou use os padrões do `docker-compose.yml`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=eventhub_user
DB_PASSWORD=eventhub123
DB_NAME=eventhub
PORT=3000
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=7d
```

### 3. Suba os containers

```bash
docker-compose up -d
```

Isso inicia:
- **MySQL** na porta `3306`
- **Backend (API)** na porta `3000`
- **phpMyAdmin** na porta `8080`

O banco é criado automaticamente pelo `banco/init.sql` na primeira execução.

### 4. Abra o frontend

Basta abrir o arquivo `frontend/index.html` no navegador. Não é necessário servidor para o frontend.

---

## Endpoints da API

### Autenticação — `/api/auth`

| Método | Rota         | Descrição           |
|--------|--------------|---------------------|
| POST   | `/cadastrar` | Cadastrar usuário   |
| POST   | `/login`     | Login e geração JWT |

### Eventos — `/api/eventos`

| Método | Rota              | Descrição                       |
|--------|-------------------|---------------------------------|
| GET    | `/`               | Buscar todos os eventos         |
| GET    | `/usuario/:id`    | Eventos de um gestor específico |
| POST   | `/`               | Criar evento                    |
| PUT    | `/:id`            | Editar evento                   |
| DELETE | `/:id`            | Excluir evento                  |

### Participantes — `/api/participantes`

| Método | Rota                          | Descrição                              |
|--------|-------------------------------|----------------------------------------|
| POST   | `/`                           | Inscrever usuário em evento            |
| GET    | `/usuario/:usuarioId`         | Inscrições de um cliente               |
| DELETE | `/:eventoId/usuario/:usuarioId` | Cancelar inscrição                   |
| GET    | `/evento/:eventoId`           | Participantes de um evento             |
| GET    | `/total/gestor/:usuarioId`    | Total de participantes do gestor       |

---

## Tipos de Usuário

### Gestor
- Cria, edita e exclui eventos
- Visualiza participantes inscritos por evento
- Dashboard com estatísticas e calendário

### Cliente
- Explora eventos disponíveis
- Se inscreve e cancela inscrições
- Dashboard pessoal com seus eventos e calendário

---

## Banco de Dados

Três tabelas principais:

- **usuarios** — id, nome, sobrenome, email, tipo (`gestor` | `cliente`), senha_hash
- **eventos** — id, nome, descricao, foto (base64), data, horario, status, usuario_id
- **participantes** — id, nome, email, evento_id, confirmado

---

## Acesso ao phpMyAdmin

Após subir os containers, acesse `http://localhost:8080` com:

- **Usuário:** `eventhub_user`
- **Senha:** `eventhub123`
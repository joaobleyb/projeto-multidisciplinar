# EventHub

Plataforma web para criação e gerenciamento de eventos, desenvolvida como projeto multidisciplinar.

---

## 📋 Requisitos

Antes de rodar o projeto, instale apenas:

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## 🚀 Como rodar o projeto

**1. Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/projeto-multidisciplinar.git
cd projeto-multidisciplinar
```

**2. Suba os containers:**
```bash
docker compose up -d --build
```

Esse comando sobe automaticamente:
- Banco de dados MySQL
- Backend Node.js na porta 3000
- phpMyAdmin na porta 8080

**3. Acesse o frontend:**

Abra o arquivo `frontend/index.html` no navegador.

---

## 🌐 Endereços

| Serviço | Endereço |
|---|---|
| Frontend | `frontend/index.html` |
| Backend | `http://localhost:3000` |
| phpMyAdmin | `http://localhost:8080` |

---

## 🗄️ Banco de dados

Para acessar o banco de dados visualmente:

1. Acesse `http://localhost:8080`
2. Usuário: `eventhub_user`
3. Senha: `eventhub123`

---

## 📡 Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/ping` | Verifica se o servidor está rodando |
| POST | `/api/auth/cadastrar` | Cadastra um novo usuário |
| POST | `/api/auth/login` | Realiza o login |

### Exemplo de cadastro:
```json
POST http://localhost:3000/api/auth/cadastrar

{
  "nome": "João",
  "sobrenome": "Silva",
  "email": "joao@email.com",
  "senha": "12345678"
}
```

### Exemplo de login:
```json
POST http://localhost:3000/api/auth/login

{
  "email": "joao@email.com",
  "senha": "12345678"
}
```

---

## 📁 Estrutura do projeto

```
projeto-multidisciplinar/
├── docker-compose.yml
├── banco/
│   └── init.sql
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   └── authController.js
│       ├── middlewares/
│       │   └── auth.js
│       └── routes/
│           └── auth.js
└── frontend/
    ├── index.html
    ├── css/
    ├── js/
    └── pages/
```

---

## 🛠️ Tecnologias utilizadas

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Banco de dados:** MySQL
- **Infraestrutura:** Docker
- **Autenticação:** JWT + bcrypt

---

## ⚠️ Observações

- Nunca suba o arquivo `.env` para o repositório
- Para parar os containers: `docker compose down`
- Para resetar o banco de dados: `docker compose down -v` (apaga todos os dados)

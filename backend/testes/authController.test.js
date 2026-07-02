process.env.JWT_SECRET = "chave_de_teste";
process.env.JWT_EXPIRES_IN = "1h";

jest.mock("../src/config/conexaoDB", () => ({
  query: jest.fn()
}));

const pool = require("../src/config/conexaoDB");
const authController = require("../src/controllers/authController");

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve retornar erro se faltar campos no cadastro", async () => {
    const req = { body: { nome: "", email: "", senha: "" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await authController.cadastrar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deve retornar erro 409 se o e-mail já estiver cadastrado", async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }]]);

    const req = {
      body: {
        nome: "João",
        sobrenome: "Silva",
        email: "joao@teste.com",
        senha: "123456",
        tipo: "cliente"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await authController.cadastrar(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ erro: "E-mail já cadastrado." });
  });

  test("deve cadastrar um novo usuário com sucesso", async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 10 }]);

    const req = {
      body: {
        nome: "Maria",
        sobrenome: "Souza",
        email: "maria@teste.com",
        senha: "123456",
        tipo: "gestor"
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await authController.cadastrar(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("deve retornar erro 401 se o e-mail não existir no login", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const req = { body: { email: "naoexiste@teste.com", senha: "123456" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: "E-mail ou senha incorretos." });
  });
});
jest.mock("../src/config/conexaoDB", () => ({
  query: jest.fn()
}));

const pool = require("../src/config/conexaoDB");
const participantesController = require("../src/controllers/participantesController");

describe("Participantes Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve retornar erro se faltar dados ao se inscrever", async () => {
    const req = { body: { usuario_id: "", evento_id: "" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await participantesController.inscrever(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: "Dados incompletos." });
  });

  test("deve retornar erro 409 se o usuário já estiver inscrito no evento", async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }]]);

    const req = { body: { usuario_id: 1, evento_id: 5 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await participantesController.inscrever(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      erro: "Você já está inscrito neste evento."
    });
  });

  test("deve inscrever o usuário com sucesso", async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ nome: "Maria Souza", email: "maria@teste.com" }]])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const req = { body: { usuario_id: 1, evento_id: 5 } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await participantesController.inscrever(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      mensagem: "Inscrição realizada com sucesso!"
    });
  });

  test("deve retornar o total de participantes de um gestor", async () => {
    pool.query.mockResolvedValueOnce([[{ total: 7 }]]);

    const req = { params: { usuarioId: "3" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await participantesController.totalParticipantesGestor(req, res);

    expect(res.json).toHaveBeenCalledWith({ total: 7 });
  });

  test("deve retornar notificações novas para o gestor", async () => {
    const notificacoesFake = [
      {
        id: 1,
        participante_nome: "João Silva",
        criado_em: "2026-07-03T12:00:00.000Z",
        evento_id: 10,
        evento_nome: "Workshop de React"
      }
    ];

    pool.query.mockResolvedValueOnce([notificacoesFake]);

    const req = {
      params: { usuarioId: "3" },
      query: { desde: String(Date.now() - 60000) }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await participantesController.notificacoesGestor(req, res);

    expect(res.json).toHaveBeenCalledWith(notificacoesFake);
  });

  test("deve retornar array vazio quando não há notificações novas", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const req = {
      params: { usuarioId: "3" },
      query: { desde: String(Date.now()) }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await participantesController.notificacoesGestor(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test("deve retornar erro 500 se o banco falhar ao buscar notificações", async () => {
    pool.query.mockRejectedValueOnce(new Error("Erro de conexão simulado"));

    const req = { params: { usuarioId: "3" }, query: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await participantesController.notificacoesGestor(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      erro: "Erro ao buscar notificações"
    });
  });
});

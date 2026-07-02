jest.mock("../src/config/conexaoDB", () => ({
  query: jest.fn()
}));

const pool = require("../src/config/conexaoDB");
const eventosController = require("../src/controllers/eventosController");

describe("Eventos Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve retornar erro se faltar campos obrigatórios", async () => {
    pool.query.mockImplementation(async (sql) => {
      if (sql.includes("SHOW COLUMNS")) {
        return [[{ Field: "campo_existente" }]];
      }

      return [[]];
    });

    const req = {
      body: {
        nome: "",
        data: "",
        horario: ""
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await eventosController.criarEvento(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      erro: "Campos obrigatórios"
    });
  });

  test("deve criar evento com dados válidos", async () => {
    pool.query.mockImplementation(async (sql) => {
      if (sql.includes("SHOW COLUMNS")) {
        return [[{ Field: "campo_existente" }]];
      }
      if (sql.includes("INSERT INTO eventos")) {
        return [{ insertId: 1 }];
      }
      return [[]];
    });

    const req = {
      body: {
        nome: "Festa de Fim de Ano",
        descricao: "Confraternização da equipe",
        foto: null,
        data: "2026-12-20",
        horario: "20:00",
        status: "Pendente",
        usuario_id: 1
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await eventosController.criarEvento(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ mensagem: "Evento criado" });
  });

  test("deve retornar erro 500 se o banco falhar ao criar evento", async () => {
    pool.query.mockImplementation(async (sql) => {
      if (sql.includes("SHOW COLUMNS")) {
        return [[{ Field: "campo_existente" }]];
      }
      throw new Error("Erro de conexão simulado");
    });

    const req = {
      body: {
        nome: "Festa",
        data: "2026-12-20",
        horario: "20:00",
        usuario_id: 1
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await eventosController.criarEvento(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: "Erro ao criar evento" });
  });

  test("deve buscar eventos de um usuário específico", async () => {
    const eventosFake = [
      { id: 1, nome: "Evento A", usuario_id: 5 },
      { id: 2, nome: "Evento B", usuario_id: 5 }
    ];

    pool.query.mockImplementation(async (sql) => {
      if (sql.includes("SHOW COLUMNS")) {
        return [[{ Field: "campo_existente" }]];
      }
      if (sql.includes("SELECT * FROM eventos WHERE usuario_id")) {
        return [eventosFake];
      }
      return [[]];
    });

    const req = { params: { id: "5" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await eventosController.buscarEventosUsuario(req, res);

    expect(res.json).toHaveBeenCalledWith(eventosFake);
  });

  test("deve excluir um evento existente", async () => {
    pool.query.mockResolvedValue([{ affectedRows: 1 }]);

    const req = { params: { id: "3" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await eventosController.excluirEvento(req, res);

    expect(res.json).toHaveBeenCalledWith({ mensagem: "Evento excluído" });
  });

});
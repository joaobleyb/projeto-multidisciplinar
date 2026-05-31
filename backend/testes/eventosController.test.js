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
});
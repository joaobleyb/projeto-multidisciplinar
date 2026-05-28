const pool = require("../config/conexaoDB");

exports.criarEvento = async (req, res) => {
  try {
    const { nome, data, horario, status, usuario_id } = req.body;

    const sql = `
            INSERT INTO eventos
            (nome, data, horario, status, usuario_id)
            VALUES (?, ?, ?, ?, ?)
        `;

    await pool.query(sql, [nome, data, horario, status, usuario_id]);

    res.status(201).json({
      mensagem: "Evento criado",
    });
  } catch (erro) {
    console.log(erro);

    res.status(500).json({
      erro: "Erro ao criar evento",
    });
  }
};

exports.buscarEventosUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [eventos] = await pool.query(
      "SELECT * FROM eventos WHERE usuario_id = ?",
      [id],
    );

    res.json(eventos);
  } catch (erro) {
    console.log(erro);

    res.status(500).json({
      erro: "Erro ao buscar eventos",
    });
  }
};
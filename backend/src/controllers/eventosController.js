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

exports.excluirEvento = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM eventos WHERE id = ?", [id]);

    res.json({ mensagem: "Evento excluído" });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao excluir evento" });
  }
};

exports.editarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, data, horario, status } = req.body;

    await pool.query(
      "UPDATE eventos SET nome = ?, data = ?, horario = ?, status = ? WHERE id = ?",
      [nome, data, horario, status, id]
    );
    
    res.json({ mensagem: "Evento atualizado" });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao editar evento" });
  }
};

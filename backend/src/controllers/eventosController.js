const pool = require("../config/conexaoDB");

let camposExtrasEventosVerificados = false;

async function garantirCamposExtrasEventos() {
  if (camposExtrasEventosVerificados) return;

  const [descricao] = await pool.query("SHOW COLUMNS FROM eventos LIKE 'descricao'");
  if (descricao.length === 0) {
    await pool.query("ALTER TABLE eventos ADD COLUMN descricao TEXT NULL AFTER nome");
  }

  const [foto] = await pool.query("SHOW COLUMNS FROM eventos LIKE 'foto'");
  if (foto.length === 0) {
    await pool.query("ALTER TABLE eventos ADD COLUMN foto LONGTEXT NULL AFTER descricao");
  }

  camposExtrasEventosVerificados = true;
}

exports.criarEvento = async (req, res) => {
  try {
    await garantirCamposExtrasEventos();

    const { nome, descricao, foto, data, horario, status, usuario_id } = req.body;

    const sql = `
            INSERT INTO eventos
            (nome, descricao, foto, data, horario, status, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

    await pool.query(sql, [
      nome,
      descricao || null,
      foto || null,
      data,
      horario,
      status,
      usuario_id,
    ]);

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
    await garantirCamposExtrasEventos();

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

exports.buscarTodosEventos = async (req, res) => {
  try {
    await garantirCamposExtrasEventos();

    const [eventos] = await pool.query(`
      SELECT eventos.*, usuarios.nome AS gestor_nome, usuarios.sobrenome AS gestor_sobrenome
      FROM eventos
      INNER JOIN usuarios ON eventos.usuario_id = usuarios.id
      ORDER BY eventos.data ASC
    `);

    res.json(eventos);
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao buscar eventos" });
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
    await garantirCamposExtrasEventos();

    const { id } = req.params;
    const { nome, descricao, foto, data, horario, status } = req.body;

    await pool.query(
      "UPDATE eventos SET nome = ?, descricao = ?, foto = ?, data = ?, horario = ?, status = ? WHERE id = ?",
      [nome, descricao || null, foto || null, data, horario, status, id]
    );
    
    res.json({ mensagem: "Evento atualizado" });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao editar evento" });
  }
};
const pool = require("../config/conexaoDB");

exports.inscrever = async (req, res) => {
  try {
    const { usuario_id, evento_id } = req.body;

    if (!usuario_id || !evento_id) {
      return res.status(400).json({ erro: "Dados incompletos." });
    }

    const [jaInscrito] = await pool.query(
      "SELECT id FROM participantes WHERE email = (SELECT email FROM usuarios WHERE id = ?) AND evento_id = ?",
      [usuario_id, evento_id],
    );

    if (jaInscrito.length > 0) {
      return res
        .status(409)
        .json({ erro: "Você já está inscrito neste evento." });
    }

    const [usuario] = await pool.query(
      "SELECT nome, email FROM usuarios WHERE id = ?",
      [usuario_id],
    );

    if (usuario.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    await pool.query(
      "INSERT INTO participantes (nome, email, evento_id, confirmado) VALUES (?, ?, ?, 1)",
      [usuario[0].nome, usuario[0].email, evento_id],
    );

    res.status(201).json({ mensagem: "Inscrição realizada com sucesso!" });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao realizar inscrição." });
  }
};

exports.buscarInscricoesUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const [usuario] = await pool.query(
      "SELECT email FROM usuarios WHERE id = ?",
      [usuarioId],
    );

    if (usuario.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const [inscricoes] = await pool.query(
      "SELECT evento_id FROM participantes WHERE email = ?",
      [usuario[0].email],
    );

    const ids = inscricoes.map((i) => i.evento_id);
    res.json(ids);
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao buscar inscrições." });
  }
};

exports.cancelarInscricao = async (req, res) => {
  try {
    const { eventoId, usuarioId } = req.params;

    const [usuario] = await pool.query(
      "SELECT email FROM usuarios WHERE id = ?",
      [usuarioId],
    );

    if (usuario.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    await pool.query(
      "DELETE FROM participantes WHERE evento_id = ? AND email = ?",
      [eventoId, usuario[0].email],
    );

    res.json({ mensagem: "Inscrição cancelada." });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao cancelar inscrição." });
  }
};

exports.buscarParticipantesEvento = async (req, res) => {
  try {
    const { eventoId } = req.params;

    const [participantes] = await pool.query(
      "SELECT id, nome, email, confirmado FROM participantes WHERE evento_id = ? ORDER BY nome ASC",
      [eventoId]
    );

    res.json(participantes);
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao buscar participantes." });
  }
};

exports.totalParticipantesGestor = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const [[resultado]] = await pool.query(
      `SELECT COUNT(p.id) AS total
       FROM participantes p
       INNER JOIN eventos e ON p.evento_id = e.id
       WHERE e.usuario_id = ?`,
      [usuarioId]
    );

    res.json({ total: resultado.total });
  } catch (erro) {
    console.log(erro);
    res.status(500).json({ erro: "Erro ao buscar total de participantes." });
  }
};
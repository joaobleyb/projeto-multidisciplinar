const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/conexaoDB");

async function cadastrar(req, res) {
  const { nome, sobrenome, email, senha, tipo } = req.body;

  if (!nome || !sobrenome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }

  if (senha.length < 6) {
    return res
      .status(400)
      .json({ erro: "A senha deve ter ao menos 6 caracteres." });
  }

  try {
    const [linhas] = await db.query("SELECT id FROM usuarios WHERE email = ?", [
      email,
    ]);

    if (linhas.length > 0) {
      return res.status(409).json({ erro: "E-mail já cadastrado." });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const [resultado] = await db.query(
      "INSERT INTO usuarios (nome, sobrenome, email, tipo, senha_hash) VALUES (?, ?, ?, ?, ?)",
      [nome, sobrenome, email, tipo, senha_hash],
    );

    return res.status(201).json({
      mensagem: "Conta criada com sucesso!",
      usuario: {
        id: resultado.insertId,
        nome,
        sobrenome,
        email,
        tipo,
      },
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Preencha e-mail e senha." });
  }

  try {
    const [linhas] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);

    if (linhas.length === 0) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    const usuario = linhas[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

module.exports = { cadastrar, login };
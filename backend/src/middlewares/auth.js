const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const cabecalho = req.headers["authorization"];

  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido." });
  }

  const token = cabecalho.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

module.exports = autenticar;
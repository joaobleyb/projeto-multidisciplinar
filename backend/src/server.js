const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const eventosRoutes = require("./routes/eventos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/eventos", eventosRoutes);

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", mensagem: "EventHub API rodando!" });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
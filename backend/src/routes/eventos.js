const express = require("express");
const router = express.Router();
const eventosController = require("../controllers/eventosController");

router.get("/:id", eventosController.buscarEventosUsuario);
router.post("/", eventosController.criarEvento);

module.exports = router;
const express = require("express");
const router = express.Router();
const eventosController = require("../controllers/eventosController");

router.get("/usuario/:id", eventosController.buscarEventosUsuario);
router.get("/", eventosController.buscarTodosEventos);
router.post("/", eventosController.criarEvento);
router.delete("/:id", eventosController.excluirEvento);
router.put("/:id", eventosController.editarEvento);

module.exports = router;

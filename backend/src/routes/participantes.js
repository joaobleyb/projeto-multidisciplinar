const express = require("express");
const router = express.Router();
const participantesController = require("../controllers/participantesController");

router.post("/", participantesController.inscrever);
router.get("/usuario/:usuarioId", participantesController.buscarInscricoesUsuario);
router.delete("/:eventoId/usuario/:usuarioId", participantesController.cancelarInscricao);
router.get("/evento/:eventoId", participantesController.buscarParticipantesEvento);
router.get("/total/gestor/:usuarioId", participantesController.totalParticipantesGestor);

module.exports = router;
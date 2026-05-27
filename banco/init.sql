-- ================================================
--  EventHub — banco/init.sql
--  Executado automaticamente pelo Docker na
--  primeira vez que o container é criado.
-- ================================================

CREATE DATABASE IF NOT EXISTS eventhub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE eventhub;

-- ── USUÁRIOS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT           NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100)  NOT NULL,
  sobrenome   VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  senha_hash  VARCHAR(255)  NOT NULL,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ── EVENTOS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id          INT           NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(255)  NOT NULL,
  data        DATE          NOT NULL,
  horario     TIME          NOT NULL,
  status      ENUM('Confirmado', 'Pendente') NOT NULL DEFAULT 'Pendente',
  usuario_id  INT           NOT NULL,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_eventos_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ── PARTICIPANTES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS participantes (
  id          INT           NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  evento_id   INT           NOT NULL,
  confirmado  TINYINT(1)    NOT NULL DEFAULT 0,
  criado_em   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_participantes_evento
    FOREIGN KEY (evento_id) REFERENCES eventos(id)
    ON DELETE CASCADE
);

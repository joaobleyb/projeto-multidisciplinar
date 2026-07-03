// ── EVENTHUB DASHBOARD CLIENTE ───────────────────────────────────────────────────────── //
// Controla o dashboard do cliente, carregando dados e exibindo eventos.
const usuario = JSON.parse(sessionStorage.getItem("usuario"));
const token = sessionStorage.getItem("token");

if (!usuario || !token) {
  window.location.href = "../index.html";
}

// Garante que apenas clientes acessem esta página
if (usuario.tipo !== "cliente") {
  window.location.href = "dashboard_gestor.html";
}

// ── PREENCHE DADOS DO USUÁRIO ─────────────────────
document.getElementById("nomeUsuario").textContent =
  usuario.nome + " " + usuario.sobrenome;

document.getElementById("emailUsuario").textContent = usuario.email;

document.getElementById("nomeBoasVindas").textContent = usuario.nome;

// Iniciais do avatar
const iniciais =
  usuario.nome.charAt(0).toUpperCase() +
  usuario.sobrenome.charAt(0).toUpperCase();
document.getElementById("avatarIniciais").textContent = iniciais;

// ── REFERÊNCIAS ───────────────────────────────────
const listaEventos = document.getElementById("listaEventos");
const listaEventosHoje = document.getElementById("listaEventosHoje");
const estadoVazio = document.getElementById("estadoVazio");

const totalInscricoes = document.getElementById("totalInscricoes");
const totalEventosHoje = document.getElementById("totalEventosHoje");
const totalConfirmados = document.getElementById("totalConfirmados");
const proximoEvento = document.getElementById("proximoEvento");

const meses = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

// Carrega os eventos em que o cliente está inscrito e atualiza o dashboard
async function carregarEventos() {
  try {
    // Busca todos os eventos + as inscrições do usuário, igual ao explorar_eventos.js
    const [resEventos, resInscricoes] = await Promise.all([
      fetch("http://localhost:3000/api/eventos"),
      fetch(`http://localhost:3000/api/participantes/usuario/${usuario.id}`),
    ]);

    const todosEventos = await resEventos.json();
    const idsInscritos = await resInscricoes.json();
    const idsInscritosSet = new Set(idsInscritos);

    // Mantém só os eventos em que o cliente está realmente inscrito
    const eventos = todosEventos.filter((evento) => idsInscritosSet.has(evento.id));

    // Remove estado vazio se houver eventos
    if (eventos.length > 0) {
      estadoVazio?.remove();
    }

    totalInscricoes.textContent = eventos.length;

    // Data de hoje local (sem UTC), pra não desalinhar o dia por fuso horário
    const hoje = new Date();
    const anoHoje = hoje.getFullYear();
    const mesHoje = String(hoje.getMonth() + 1).padStart(2, "0");
    const diaHoje = String(hoje.getDate()).padStart(2, "0");
    const hojeFormatado = `${anoHoje}-${mesHoje}-${diaHoje}`;

    // ── EVENTOS HOJE ────────────────────────────
    const eventosHoje = eventos.filter((evento) => {
      const dataEvento = evento.data.split("T")[0];
      return dataEvento === hojeFormatado;
    });

    totalEventosHoje.textContent = eventosHoje.length;

    listaEventosHoje.innerHTML = "";

    if (eventosHoje.length === 0) {
      listaEventosHoje.innerHTML =
        '<p class="sem-eventos-hoje">Nenhum evento para hoje</p>';
    } else {
      eventosHoje.forEach((evento) => {
        const item = document.createElement("div");
        item.classList.add("evento-hoje-item");
        item.innerHTML = `
          <div class="evento-hoje-barra"></div>
          <div class="evento-hoje-detalhe">
            <span class="evento-hoje-nome">${evento.nome}</span>
            <span class="evento-hoje-horario">${evento.horario}</span>
          </div>
        `;
        listaEventosHoje.appendChild(item);
      });
    }

    // ── ESTATÍSTICAS ────────────────────────────
    const confirmados = eventos.filter((e) => e.status === "Confirmado").length;
    totalConfirmados.textContent = confirmados;

    // Próximo evento futuro (a partir de hoje, inclusive)
    const futuros = eventos
      .filter((e) => e.data.split("T")[0] >= hojeFormatado)
      .sort((a, b) => a.data.localeCompare(b.data));

    if (futuros.length > 0) {
      const proximo = futuros[0];
      const [ano, mes, dia] = proximo.data.split("T")[0].split("-");
      proximoEvento.textContent = `${dia}/${mes}`;
    } else {
      proximoEvento.textContent = "—";
    }

    // ── LISTA DE EVENTOS ────────────────────────
    listaEventos.querySelectorAll(".evento-card").forEach((card) => card.remove());

    eventos.forEach((evento) => {
      const card = document.createElement("div");
      card.classList.add("evento-card");

      const [ano, mes, dia] = evento.data.split("T")[0].split("-");
      const data = new Date(Number(ano), Number(mes) - 1, Number(dia));

      const diaFormatado = data.getDate();
      const mesFormatado = meses[data.getMonth()];

      card.innerHTML = `
        <div class="evento-item">
          <div class="evento-data">
            <span class="evento-dia">${diaFormatado}</span>
            <span class="evento-mes">${mesFormatado}</span>
          </div>
          <div class="evento-info">
            <h3>${evento.nome}</h3>
            <div class="evento-meta">
              <span>${evento.horario}</span>
              <span class="badge ${evento.status}">${evento.status}</span>
            </div>
          </div>
        </div>
      `;

      listaEventos.appendChild(card);
    });

    // Atualiza calendário com marcações
    gerarCalendario(mesAtual, anoAtual, eventos);
  } catch (erro) {
    console.log(erro);
  }
}

let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// Gera o calendário dos eventos do cliente
function gerarCalendario(mes, ano, eventos = []) {
  const grid = document.querySelector(".calendario-grid");
  const tituloMes = document.getElementById("tituloMes");

  tituloMes.textContent = `${nomesMeses[mes]} ${ano}`;

  // Remove dias antigos, mantém cabeçalhos
  grid.querySelectorAll(".cal-dia, .cal-dia.vazio").forEach((d) => d.remove());

  const hoje = new Date();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  // Dias com eventos neste mês/ano
  const diasComEvento = new Set(
    eventos
      .map((e) => {
        const [eAno, eMes, eDia] = e.data.split("T")[0].split("-");
        if (Number(eAno) === ano && Number(eMes) - 1 === mes) {
          return Number(eDia);
        }
        return null;
      })
      .filter(Boolean)
  );

  // Espaços vazios
  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement("div");
    vazio.classList.add("cal-dia", "vazio");
    grid.appendChild(vazio);
  }

  // Dias do mês
  for (let d = 1; d <= totalDias; d++) {
    const cel = document.createElement("div");
    cel.classList.add("cal-dia");
    cel.textContent = d;

    if (
      d === hoje.getDate() &&
      mes === hoje.getMonth() &&
      ano === hoje.getFullYear()
    ) {
      cel.classList.add("hoje");
    }

    if (diasComEvento.has(d)) {
      cel.classList.add("evento-marcado");
    }

    grid.appendChild(cel);
  }
}

// ── NAVEGAÇÃO DO CALENDÁRIO ───────────────────────
const [btnAnterior, btnProximo] = document.querySelectorAll(".btn-cal-nav");

btnAnterior.addEventListener("click", () => {
  mesAtual--;
  if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
  gerarCalendario(mesAtual, anoAtual);
});

btnProximo.addEventListener("click", () => {
  mesAtual++;
  if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
  gerarCalendario(mesAtual, anoAtual);
});

// ── NOTIFICAÇÕES ──────────────────────────────────────────────────────────────────── //

const btnNotificacao = document.querySelector(".btn-notificacao");
const notificacaoBadge = document.querySelector(".notificacao-badge");
const notificacaoDropdown = document.getElementById("notificacaoDropdown");
const notificacaoLista = document.getElementById("notificacaoLista");

let ultimaChecagemNotificacoes = Date.now();
let notificacoesNaoLidas = [];
let audioCtx = null;

// Toca um beep curto sem precisar de nenhum arquivo de áudio
function tocarSomNotificacao() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (erro) {
    console.log(erro);
  }
}

function renderizarNotificacoes() {
  if (notificacoesNaoLidas.length === 0) {
    notificacaoLista.innerHTML =
      '<p class="notificacoes-vazio">Nenhuma notificação nova</p>';
    return;
  }

  notificacaoLista.innerHTML = "";

  notificacoesNaoLidas.forEach((n) => {
    const item = document.createElement("div");
    item.classList.add("notificacao-item");
    item.innerHTML = `<strong>${n.participante_nome}</strong> se inscreveu em <strong>${n.evento_nome}</strong>`;
    notificacaoLista.appendChild(item);
  });
}

async function verificarNotificacoes() {
  try {
    const resposta = await fetch(
      `http://localhost:3000/api/participantes/notificacoes/gestor/${usuario.id}?desde=${ultimaChecagemNotificacoes}`
    );
    const novas = await resposta.json();

    if (novas.length > 0) {
      notificacoesNaoLidas = [...novas, ...notificacoesNaoLidas].slice(0, 20);
      renderizarNotificacoes();
      notificacaoBadge.classList.add("ativo");
      tocarSomNotificacao();
    }

    ultimaChecagemNotificacoes = Date.now();
  } catch (erro) {
    console.log(erro);
  }
}

btnNotificacao.addEventListener("click", (e) => {
  e.stopPropagation();
  notificacaoDropdown.classList.toggle("ativo");
  notificacaoBadge.classList.remove("ativo");
});

document.addEventListener("click", () => {
  notificacaoDropdown.classList.remove("ativo");
});

setInterval(verificarNotificacoes, 15000);

// ── LOGOUT ────────────────────────────────────────
document.getElementById("btnLogout").addEventListener("click", (e) => {
  e.preventDefault();
  sessionStorage.removeItem("usuario");
  sessionStorage.removeItem("token");
  window.location.href = "../index.html";
});

// ── INICIALIZAÇÃO ─────────────────────────────────
gerarCalendario(mesAtual, anoAtual);
carregarEventos();
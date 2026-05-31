// ── EVENTHUB EXPLORAR EVENTOS ─────────────────────────────────────────────────────── //
// Página de exploração de eventos para clientes, com busca e filtro.
const usuario = JSON.parse(localStorage.getItem("usuario"));
const token = localStorage.getItem("token");

if (!usuario || !token) {
  window.location.href = "../index.html";
} else if (usuario.tipo !== "cliente") {
  window.location.href = "dashboard_gestor.html";
}

document.getElementById("nomeUsuario").textContent =
  usuario.nome + " " + usuario.sobrenome;
document.getElementById("emailUsuario").textContent = usuario.email;
document.getElementById("avatarIniciais").textContent =
  usuario.nome.charAt(0).toUpperCase() +
  usuario.sobrenome.charAt(0).toUpperCase();

const listaEventos = document.getElementById("listaEventos");
const estadoVazio = document.getElementById("estadoVazio");
const estadoCarregando = document.getElementById("estadoCarregando");
const campoBusca = document.getElementById("campoBusca");
const filtroStatus = document.getElementById("filtroStatus");

const meses = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

let todosEventos = [];

// Escapa texto para evitar injeção de HTML nos cards
function escaparHtml(valor = "") {
  return String(valor).replace(/[&<>"']/g, (caractere) => {
    const mapa = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return mapa[caractere];
  });
}

// Busca eventos disponíveis e renderiza a lista
async function carregarEventos() {
  try {
    const resposta = await fetch("http://localhost:3000/api/eventos");
    todosEventos = await resposta.json();
    renderizarEventos(todosEventos);
  } catch (erro) {
    console.log(erro);
    estadoCarregando.innerHTML =
      '<p style="color:#f87171">Erro ao carregar eventos. Verifique se o servidor está rodando.</p>';
  }
}

// Renderiza cards de evento e controla o estado vazio
function renderizarEventos(eventos) {
  estadoCarregando?.remove();
  listaEventos
    .querySelectorAll(".evento-card")
    .forEach((card) => card.remove());

  if (eventos.length === 0) {
    estadoVazio.style.display = "flex";
    return;
  }

  estadoVazio.style.display = "none";

  eventos.forEach((evento) => {
    const [ano, mes, dia] = evento.data.split("T")[0].split("-");
    const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    const iniciaisGestor =
      evento.gestor_nome.charAt(0).toUpperCase() +
      evento.gestor_sobrenome.charAt(0).toUpperCase();
    const nomeEvento = escaparHtml(evento.nome);
    const descricaoEvento = escaparHtml(
      evento.descricao || "Evento sem descrição cadastrada.",
    );
    const gestorNome = escaparHtml(
      `${evento.gestor_nome} ${evento.gestor_sobrenome}`,
    );
    const fotoValida =
      typeof evento.foto === "string" && evento.foto.startsWith("data:image/");

    const card = document.createElement("div");
    card.classList.add("evento-card");
    card.dataset.nome = evento.nome.toLowerCase();
    card.dataset.status = evento.status;
    const fotoEvento = fotoValida
      ? `<img class="evento-foto" src="${evento.foto}" alt="Foto do evento" />`
      : `<div class="evento-foto-placeholder">Sem foto</div>`;

    card.innerHTML = `
      ${fotoEvento}

      <div class="evento-card-topo">
        <div class="evento-data-bloco">
          <span class="evento-dia">${data.getDate()}</span>
          <span class="evento-mes">${meses[data.getMonth()]}</span>
        </div>
        <span class="badge ${evento.status}">${escaparHtml(evento.status)}</span>
      </div>

      <div class="evento-card-corpo">
        <span class="evento-nome">${nomeEvento}</span>
        <p class="evento-descricao">${descricaoEvento}</p>
        <span class="evento-horario">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          ${evento.horario}
        </span>
      </div>

      <div class="evento-gestor">
        <div class="evento-gestor-avatar">${iniciaisGestor}</div>
        ${gestorNome}
      </div>
    `;

    listaEventos.appendChild(card);
  });
}

// Filtra eventos pelo nome e pelo status selecionado
function filtrar() {
  const busca = campoBusca.value.toLowerCase().trim();
  const status = filtroStatus.value;

  const eventosFiltrados = todosEventos.filter((evento) => {
    const nomeOk = evento.nome.toLowerCase().includes(busca);
    const statusOk = !status || evento.status === status;
    return nomeOk && statusOk;
  });

  renderizarEventos(eventosFiltrados);
}

campoBusca.addEventListener("input", filtrar);
filtroStatus.addEventListener("change", filtrar);

document.getElementById("btnLogout").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");
  window.location.href = "../index.html";
});

carregarEventos();

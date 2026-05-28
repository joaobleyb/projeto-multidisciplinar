const listaEventos = document.getElementById("listaEventos");
const listaEventosHoje = document.getElementById("listaEventosHoje");
const totalEventos = document.getElementById("totalEventos");

const btnLogout = document.getElementById("btnLogout");
const modal = document.getElementById("modalEvento");
const btnNovoEvento = document.getElementById("btnNovoEvento");
const fecharModal = document.getElementById("fecharModal");
const formEvento = document.getElementById("formEvento");

const usuario = JSON.parse(localStorage.getItem("usuario"));
const token = localStorage.getItem("token");

if (!usuario || !token) {
  window.location.href = "../index.html";
}

document.getElementById("nomeUsuario").textContent =
  usuario.nome + " " + usuario.sobrenome;

document.getElementById("emailUsuario").textContent = usuario.email;

// Muda o html para modal ativo que aciona o css e faz aparecer o modal na tela────────────────────────────────────────────────────────── //

btnNovoEvento.addEventListener("click", () => {
  modal.classList.add("ativo");
});

// Muda o html para modal novamente que desativa o css─────────────────────────────────────────────────────────────────────────────────── //

fecharModal.addEventListener("click", () => {
  modal.classList.remove("ativo");
});

// Função para carregar os eventos ───────────────────────────────────────────────────────────────────────────────────────────────────── //

async function carregarEventos() {
  try {
    const resposta = await fetch(
      `http://localhost:3000/api/eventos/usuario/${usuario.id}`,
    );

    const eventos = await resposta.json();

    listaEventos.innerHTML = "";

    totalEventos.textContent = eventos.length;

    listaEventosHoje.innerHTML = "";

    // Tabela de eventos hoje (Abaixo do calendario)

    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split("T")[0];

    const eventosHoje = eventos.filter((evento) => {
      const dataEvento = evento.data.split("T")[0];
      return dataEvento === hojeFormatado;
    });

    if (eventosHoje.length === 0) {
      listaEventosHoje.innerHTML = `
    <p class="sem-eventos-hoje">Nenhum evento para hoje</p>
  `;
    } else {
      eventosHoje.forEach((evento) => {
        const itemHoje = document.createElement("div");
        itemHoje.classList.add("evento-hoje-item");

        itemHoje.innerHTML = `
      <div class="evento-hoje-barra laranja"></div>

      <div class="evento-hoje-detalhe">
        <span class="evento-hoje-nome">${evento.nome}</span>
        <span class="evento-hoje-horario">${evento.horario}</span>
      </div>
    `;

        listaEventosHoje.appendChild(itemHoje);
      });
    }

    eventos.forEach((evento) => {
      console.log(evento.data);
      const card = document.createElement("div");

      card.classList.add("evento-card");

      const [ano, mes, dia] = evento.data.split("T")[0].split("-");
      const data = new Date(ano, mes - 1, dia);

      const diaFormatado = data.getDate();

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

      const mesFormatado = meses[data.getMonth()];

      card.innerHTML = `
            <div class="evento-item">

                <div class="evento-data">
                    <span class="evento-dia">
                        ${diaFormatado}
                    </span>

                    <span class="evento-mes">
                        ${mesFormatado}
                    </span>
                </div>

                <div class="evento-info">
                    <h3>${evento.nome}</h3>

                    <div class="evento-meta">
                        <span>0 Participantes</span>

                        <span class="badge ${evento.status}">
                            ${evento.status}
                        </span>
                    </div>
                </div>

                <div class="evento-menu-wrapper">
                    <button class="evento-menu">⋮</button>
                    <div class="evento-menu-dropdown">
                        <button class="editar">✏️ Editar</button>
                        <button class="excluir">🗑️ Excluir</button>
                    </div>
                </div>

            </div>
        `;

      listaEventos.prepend(card);
      const btnMenu = card.querySelector(".evento-menu");
      const dropdown = card.querySelector(".evento-menu-dropdown");

      btnMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("ativo");
      });

      card.querySelector(".excluir").addEventListener("click", () => {
        excluirEvento(evento.id);
      });

      card.querySelector(".editar").addEventListener("click", () => {
        abrirEdicao(evento);
      });
    });
  } catch (erro) {
    console.log(erro);
  }
}

// ── Cria os eventos ────────────────────────────────────────────────────────────────────────────────────────────────────────────── //

formEvento.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const evento = {
      nome: document.getElementById("nomeEvento").value,
      data: document.getElementById("dataEvento").value,
      horario: document.getElementById("horarioEvento").value,
      status: document.getElementById("statusEvento").value,
      usuario_id: usuario.id,
    };

    await fetch("http://localhost:3000/api/eventos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(evento),
    });

    modal.classList.remove("ativo");

    formEvento.reset();

    carregarEventos();
  } catch (erro) {
    console.log(erro);
  }
});

// ── Carrega todos os eventos ─────────────────────────────────────────────────────────────────────────────────────────────────────── //

carregarEventos();

// ── CALENDÁRIO DINÂMICO ──────────────────────────────────────────────────────────────────────────────────────────────────────────── //

let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function gerarCalendario(mes, ano) {
  const grid = document.querySelector(".calendario-grid");
  const tituloMes = document.querySelector(".calendario-nav span");

  tituloMes.textContent = `${nomesMeses[mes]} ${ano}`;

  // Remove os dias antigos, mantém os cabeçalhos (D S T Q Q S S)
  const diasAntigos = grid.querySelectorAll(".cal-dia, .cal-dia.vazio");
  diasAntigos.forEach((d) => d.remove());

  const hoje = new Date();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  // Espaços vazios antes do dia 1
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

    grid.appendChild(cel);
  }
}

// Botões de navegação
const btnAnterior = document.querySelectorAll(".btn-cal-nav")[0];
const btnProximo = document.querySelectorAll(".btn-cal-nav")[1];

btnAnterior.addEventListener("click", () => {
  mesAtual--;
  if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  }
  gerarCalendario(mesAtual, anoAtual);
});

btnProximo.addEventListener("click", () => {
  mesAtual++;
  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  }
  gerarCalendario(mesAtual, anoAtual);
});

// Iniciar
gerarCalendario(mesAtual, anoAtual);

// Fecha dropdown ao clicar fora

document.addEventListener("click", () => {
  document
    .querySelectorAll(".evento-menu-dropdown.ativo")
    .forEach((d) => d.classList.remove("ativo"));
});

// ── Função de exclusão de eventos ─────────────────────────────────────────────────────────────────────────────────────────────────── //

async function excluirEvento(id) {
  if (!confirm("Tem certeza que deseja excluir este evento?")) return;

  try {
    await fetch(`http://localhost:3000/api/eventos/${id}`, {
      method: "DELETE",
    });

    carregarEventos();
  } catch (erro) {
    console.log(erro);
  }
}

// ── Função de edição de eventos ─────────────────────────────────────────────────────────────────────────────────────────────────── //

function abrirEdicao(evento) {
  document.getElementById("editarId").value = evento.id;
  document.getElementById("editarNome").value = evento.nome;
  document.getElementById("editarHorario").value = evento.horario;
  document.getElementById("editarData").value = evento.data.split("T")[0];
  document.getElementById("editarStatus").value = evento.status;

  document.getElementById("modalEditarEvento").classList.add("ativo");
}

// Fechar modal editar
document.getElementById("fecharModalEditar").addEventListener("click", () => {
  document.getElementById("modalEditarEvento").classList.remove("ativo");
});

// Salvar edição
document
  .getElementById("formEditarEvento")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editarId").value;

    const evento = {
      nome: document.getElementById("editarNome").value,
      data: document.getElementById("editarData").value,
      horario: document.getElementById("editarHorario").value,
      status: document.getElementById("editarStatus").value,
    };

    try {
      await fetch(`http://localhost:3000/api/eventos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evento),
      });

      document.getElementById("modalEditarEvento").classList.remove("ativo");
      carregarEventos();
    } catch (erro) {
      console.log(erro);
    }
  });

// ── Botão Logout ─────────────────────────────────────────────────────────────────────────────────────────────────── //

btnLogout.addEventListener("click", (e) => {
  e.preventDefault();

  localStorage.removeItem("usuario");
  localStorage.removeItem("token");

  window.location.href = "../index.html";
});

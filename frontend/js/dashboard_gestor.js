// ── EVENTHUB DASHBOARD GESTOR ───────────────────────────────────────────────────────── //
// Controle de eventos do gestor, modal de cadastro/edição, e calendário.
const listaEventos = document.getElementById("listaEventos");
const listaEventosHoje = document.getElementById("listaEventosHoje");
const totalEventos = document.getElementById("totalEventos");

const btnLogout = document.getElementById("btnLogout");
const modal = document.getElementById("modalEvento");
const btnNovoEvento = document.getElementById("btnNovoEvento");
const fecharModal = document.getElementById("fecharModal");
const formEvento = document.getElementById("formEvento");
const inputFotoEvento = document.getElementById("fotoEvento");
const inputEditarFoto = document.getElementById("editarFoto");
const editarFotoAtual = document.getElementById("editarFotoAtual");
const editarFotoPreview = document.getElementById("editarFotoPreview");
const removerFotoEditar = document.getElementById("removerFotoEditar");

const usuario = JSON.parse(sessionStorage.getItem("usuario"));
const token = sessionStorage.getItem("token");

if (!usuario || !token) {
  window.location.href = "../index.html";
}

document.getElementById("nomeUsuario").textContent =
  usuario.nome + " " + usuario.sobrenome;

document.getElementById("emailUsuario").textContent = usuario.email;

// ── REDIMENSIONAR FOTO DO EVENTO ─────────────────────────────────────────────────────── //

function redimensionarFoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const imagem = new Image();

      imagem.onload = () => {
        const tamanhoMaximo = 900;
        const escala = Math.min(
          tamanhoMaximo / imagem.width,
          tamanhoMaximo / imagem.height,
          1,
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(imagem.width * escala);
        canvas.height = Math.round(imagem.height * escala);

        const contexto = canvas.getContext("2d");
        contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      imagem.onerror = reject;
      imagem.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function lerFotoEvento(input) {
  const file = input.files[0];

  if (!file) return "";

  if (!file.type.startsWith("image/")) {
    alert("Selecione um arquivo de imagem.");
    return "";
  }

  return redimensionarFoto(file);
}

function atualizarPreviewEdicao(foto) {
  if (!foto) {
    editarFotoPreview.style.display = "none";
    removerFotoEditar.style.display = "none";
    editarFotoPreview.removeAttribute("src");
    return;
  }

  editarFotoPreview.src = foto;
  editarFotoPreview.style.display = "block";
  removerFotoEditar.style.display = "inline-flex";
}

// Abre o modal de novo evento

btnNovoEvento.addEventListener("click", () => {
  modal.classList.add("ativo");
});

// Fecha o modal de novo evento

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

    fetch(`http://localhost:3000/api/participantes/total/gestor/${usuario.id}`)
      .then((r) => r.json())
      .then((dados) => {
        document.querySelectorAll(".stat-valor")[1].textContent = dados.total;
      })
      .catch(() => {});

    listaEventosHoje.innerHTML = "";

    // Tabela de eventos hoje (Abaixo do calendario)
    // Usa data local (não UTC) para não desalinhar o dia por causa do fuso horário

    const hoje = new Date();
    const anoHoje = hoje.getFullYear();
    const mesHoje = String(hoje.getMonth() + 1).padStart(2, "0");
    const diaHoje = String(hoje.getDate()).padStart(2, "0");
    const hojeFormatado = `${anoHoje}-${mesHoje}-${diaHoje}`;

    const eventosHoje = eventos.filter((evento) => {
      const dataEvento = evento.data.split("T")[0];
      return dataEvento === hojeFormatado;
    });

    document.getElementById("totalEventosHoje").textContent = eventosHoje.length;

    const eventosEsteMes = eventos.filter((evento) => {
      const [ano, mes] = evento.data.split("T")[0].split("-");
      return Number(ano) === anoHoje && Number(mes) - 1 === hoje.getMonth();
    });

    document.getElementById("totalEventosEsteMes").textContent = eventosEsteMes.length;

    ultimosEventosCarregados = eventos;

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
                        <span id="participantes-evento-${evento.id}">0 Participantes</span>

                        <span class="badge ${evento.status}">
                            ${evento.status}
                        </span>
                    </div>
                </div>

                <div class="evento-menu-wrapper">
                    <button class="evento-menu">⋮</button>
                    <div class="evento-menu-dropdown">
                        <button class="participantes">👥 Participantes</button>
                        <button class="editar">✏️ Editar</button>
                        <button class="excluir">🗑️ Excluir</button>
                    </div>
                </div>

            </div>
        `;

      listaEventos.prepend(card);

      fetch(`http://localhost:3000/api/participantes/evento/${evento.id}`)
        .then((r) => r.json())
        .then((participantes) => {
          const el = document.getElementById(
            `participantes-evento-${evento.id}`,
          );
          if (el) {
            el.textContent = `${participantes.length} Participante${participantes.length !== 1 ? "s" : ""}`;
          }
        })
        .catch(() => {});

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

      card.querySelector(".participantes").addEventListener("click", () => {
        abrirParticipantes(evento.id, evento.nome);
      });
    });

    gerarCalendario(mesAtual, anoAtual, eventos);
  } catch (erro) {
    console.log(erro);
  }
}

// ── Cria os eventos que esta no eventosController.js ─────────────────────────────────────────────────────────────────────────────────────────────────────── //

formEvento.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const evento = {
      nome: document.getElementById("nomeEvento").value,
      descricao: document.getElementById("descricaoEvento").value.trim(),
      foto: await lerFotoEvento(inputFotoEvento),
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
let ultimosEventosCarregados = [];

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

function gerarCalendario(mes, ano, eventos = []) {
  const grid = document.querySelector(".calendario-grid");
  const tituloMes = document.querySelector(".calendario-nav span");

  tituloMes.textContent = `${nomesMeses[mes]} ${ano}`;

  // Remove os dias antigos, mantém os cabeçalhos (D S T Q Q S S)
  const diasAntigos = grid.querySelectorAll(".cal-dia, .cal-dia.vazio");
  diasAntigos.forEach((d) => d.remove());

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

    if (diasComEvento.has(d)) {
      cel.classList.add("evento-marcado");
    }

    grid.appendChild(cel);
  }
}

// Botão para ir ao mês anterior

const btnAnterior = document.querySelectorAll(".btn-cal-nav")[0];

// Botão para ir ao próximo mês

const btnProximo = document.querySelectorAll(".btn-cal-nav")[1];

btnAnterior.addEventListener("click", () => {
  mesAtual--;
  if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  }
  gerarCalendario(mesAtual, anoAtual, ultimosEventosCarregados);
});

btnProximo.addEventListener("click", () => {
  mesAtual++;
  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  }
  gerarCalendario(mesAtual, anoAtual, ultimosEventosCarregados);
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
  document.getElementById("editarDescricao").value = evento.descricao || "";
  editarFotoAtual.value = evento.foto || "";
  inputEditarFoto.value = "";
  atualizarPreviewEdicao(evento.foto);
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
// Remove a foto atual no formulário de edição
removerFotoEditar.addEventListener("click", () => {
  editarFotoAtual.value = "";
  inputEditarFoto.value = "";
  atualizarPreviewEdicao("");
});

// Atualiza o preview de imagem quando o usuário troca a foto
inputEditarFoto.addEventListener("change", async () => {
  const novaFoto = await lerFotoEvento(inputEditarFoto);
  if (novaFoto) atualizarPreviewEdicao(novaFoto);
});

// Envia a edição do evento para o backend
document
  .getElementById("formEditarEvento")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editarId").value;
    const novaFoto = await lerFotoEvento(inputEditarFoto);

    const evento = {
      nome: document.getElementById("editarNome").value,
      descricao: document.getElementById("editarDescricao").value.trim(),
      foto: novaFoto || editarFotoAtual.value || null,
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

// ── MODAL PARTICIPANTES ───────────────────────────────────────── //

document
  .getElementById("fecharModalParticipantes")
  .addEventListener("click", () => {
    document.getElementById("modalParticipantes").classList.remove("ativo");
  });

async function abrirParticipantes(eventoId, nomeEvento) {
  const modal = document.getElementById("modalParticipantes");
  const lista = document.getElementById("listaParticipantes");
  const count = document.getElementById("participantesCount");

  modal.querySelector("h2").textContent = `Participantes — ${nomeEvento}`;
  lista.innerHTML = "";
  count.textContent = "Carregando...";
  modal.classList.add("ativo");

  try {
    const resposta = await fetch(
      `http://localhost:3000/api/participantes/evento/${eventoId}`,
    );
    const participantes = await resposta.json();

    count.textContent = `${participantes.length} participante${participantes.length !== 1 ? "s" : ""}`;

    if (participantes.length === 0) {
      lista.innerHTML =
        '<p class="participantes-vazio">Nenhum participante inscrito ainda.</p>';
      return;
    }

    participantes.forEach((p) => {
      const iniciais = p.nome
        .split(" ")
        .map((n) => n.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");

      const item = document.createElement("div");
      item.classList.add("participante-item");
      item.innerHTML = `
        <div class="participante-avatar">${iniciais}</div>
        <div class="participante-info">
          <span class="participante-nome">${p.nome}</span>
          <span class="participante-email">${p.email}</span>
        </div>
      `;
      lista.appendChild(item);
    });
  } catch (erro) {
    count.textContent = "";
    lista.innerHTML =
      '<p class="participantes-vazio" style="color:#f87171">Erro ao carregar participantes.</p>';
    console.log(erro);
  }
}

// Logout do usuário e retorno à tela de login

btnLogout.addEventListener("click", (e) => {
  e.preventDefault();

  sessionStorage.removeItem("usuario");
  sessionStorage.removeItem("token");

  window.location.href = "../index.html";
});
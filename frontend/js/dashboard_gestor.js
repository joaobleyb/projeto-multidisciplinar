const listaEventos = document.getElementById("listaEventos");
const totalEventos = document.getElementById("totalEventos");

const modal = document.getElementById("modalEvento");
const btnNovoEvento = document.getElementById("btnNovoEvento");
const fecharModal = document.getElementById("fecharModal");
const formEvento = document.getElementById("formEvento");

const usuario = JSON.parse(localStorage.getItem("usuario"));

document.getElementById("nomeUsuario").textContent =
  usuario.nome + " " + usuario.sobrenome;

document.getElementById("emailUsuario").textContent = usuario.email;

// ABRIR MODAL
btnNovoEvento.addEventListener("click", () => {
  modal.style.display = "flex";
});

// FECHAR MODAL
fecharModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// CARREGAR EVENTOS
async function carregarEventos() {
  try {
    const resposta = await fetch(
      `http://localhost:3000/api/eventos/${usuario.id}`,
    );

    const eventos = await resposta.json();

    listaEventos.innerHTML = "";

    totalEventos.textContent = eventos.length;

    eventos.forEach((evento) => {
      const card = document.createElement("div");

      card.classList.add("evento-card");

      const data = new Date(evento.data);

      const dia = data.getDate();

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

      const mes = meses[data.getMonth()];
      card.innerHTML = `
            <div class="evento-item">

                <div class="evento-data">
                    <span class="evento-dia">
                        ${dia}
                    </span>

                    <span class="evento-mes">
                        ${mes}
                    </span>
                </div>

                <div class="evento-info">
                    <h3>${evento.nome}</h3>

                    <div class="evento-meta">
                        <span>${evento.horario}</span>

                        <span class="badge ${evento.status}">
                            ${evento.status}
                        </span>
                    </div>
                </div>

                <button class="evento-menu">
                    ⋮
                </button>

            </div>
        `;

      listaEventos.prepend(card);
    });
  } catch (erro) {
    console.log(erro);
  }
}

// CRIAR EVENTO

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

    modal.style.display = "none";

    formEvento.reset();

    carregarEventos();
  } catch (erro) {
    console.log(erro);
  }
});

// INICIAR
carregarEventos();

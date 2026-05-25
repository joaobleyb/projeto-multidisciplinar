const btnNovoEvento = document.getElementById("btnNovoEvento");

const modal = document.getElementById("modalEvento");

const fecharModal = document.getElementById("fecharModal");

const formModel = document.getElementById("formEvento");


// ABRIR MODAL
btnNovoEvento.addEventListener("click", () => {
    modal.classList.add("ativo");
});


// FECHAR MODAL
fecharModal.addEventListener("click", () => {
    modal.classList.remove("ativo");
});

formEvento.addEventListener("submit", (event) => {

    // Impede recarregar a página
    event.preventDefault();


    // PEGAR VALORES
    const nomeEvento = document.getElementById("nomeEvento").value;

    const horarioEvento = document.getElementById("horarioEvento").value;

    const dataEvento = document.getElementById("dataEvento").value;

    const statusEvento = document.getElementById("statusEvento").value;


    // PEGAR DIA E MÊS

    const [ano, mesNumero, diaNumero] = dataEvento.split("-");

    const dia = diaNumero;

    const meses = [
        "Jan", "Fev", "Mar",
        "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set",
        "Out", "Nov", "Dez"
    ];

    const mes = meses[parseInt(mesNumero) - 1];

    // LISTA DE EVENTOS
    const listaEventos = document.querySelector(".eventos-lista");


    // CRIAR CARD
    const novoEvento = document.createElement("div");

    novoEvento.classList.add("evento-item");


    novoEvento.innerHTML = `
    
        <div class="evento-data">
            <span class="evento-dia">${dia}</span>
            <span class="evento-mes">${mes}</span>
        </div>

        <div class="evento-info">

            <h3>${nomeEvento}</h3>

            <div class="evento-meta">

                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                0 participantes

                <span class="badge ${statusEvento}">
                    ${statusEvento}
                </span>

            </div>

        </div>

        <button class="evento-menu">
            ⋮
        </button>
    
    `;


    // ADICIONAR NA LISTA
    listaEventos.prepend(novoEvento);


    // FECHAR MODAL
    modal.classList.remove("ativo");


    // LIMPAR FORM
    formEvento.reset();

});

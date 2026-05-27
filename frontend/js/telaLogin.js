// ── FRASES ALEATÓRIAS ─────────────────────────────
const frases = [
  "Cada grande evento começa com um simples agendamento, mas é a organização que transforma momentos comuns em experiências inesquecíveis.",
  "Planejar com antecedência é o primeiro passo para garantir eventos organizados, tranquilos e cheios de momentos especiais para todos.",
  "Eventos bem organizados nascem de agendas bem estruturadas, porque cada detalhe faz diferença na experiência final das pessoas.",
  "Uma boa organização transforma ideias em eventos memoráveis, criando experiências únicas desde o primeiro agendamento realizado no sistema.",
  "Seu próximo grande evento pode começar agora, com um agendamento simples, rápido e organizado em poucos minutos."
];

document.getElementById("frase").textContent =
  frases[Math.floor(Math.random() * frases.length)];


// ── LOGIN ─────────────────────────────────────────
const btnEntrar = document.getElementById("btnEntrar");

btnEntrar.addEventListener("click", async (event) => {
  event.preventDefault(); // Para previnir de dar reload no codigo antes de preencher

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  // ── VALIDAÇÕES NO FRONTEND ─────────────────────
  if (!email || !senha) {
    alert("Preencha e-mail e senha.");
    return;
  }

  // ── ENVIAR PARA O BACKEND ──────────────────────
  try {
    btnEntrar.disabled = true;
    btnEntrar.textContent = "Entrando...";

    const resposta = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || "E-mail ou senha incorretos.");
      return;
    }

    // ── SALVAR TOKEN E DADOS DO USUÁRIO ────────────
    localStorage.setItem("token", dados.token);
    localStorage.setItem("usuario", JSON.stringify(dados.usuario));

    // ── REDIRECIONAR PARA O DASHBOARD ──────────────
    window.location.href = "pages/dashboard_cliente.html";

  } catch (erro) {
    alert("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
  } finally {
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar";
  }
});
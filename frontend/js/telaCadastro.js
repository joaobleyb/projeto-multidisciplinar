// Gerador de frases aleatorias para a tela de cadastro

const frases = [
  "Planeje eventos inesquecíveis com organização simples, moderna e feita para todos os momentos especiais.",
  "Transforme ideias em celebrações incríveis com uma plataforma prática e elegante para organizar tudo.",
  "Gerencie convidados, horários e detalhes importantes sem complicações e com muito mais praticidade.",
  "Organize eventos com facilidade e aproveite cada momento sem preocupações com planejamento.",
  "Seu próximo grande evento pode começar agora, com um agendamento simples, rápido e organizado em poucos minutos."
];

const fraseAleatoria =
  frases[Math.floor(Math.random() * frases.length)];

document.getElementById("frase").textContent = fraseAleatoria;


// ── CADASTRO ──────────────────────────────────────

const btnCadastrar = document.getElementById("btnCadastrar");
 
btnCadastrar.addEventListener("click", async (event) => { // Async para poder usar o await no codigo
  event.preventDefault(); // Previne de dar reload antes de preencher todos os campos

  const nome           = document.getElementById("nome").value.trim();
  const sobrenome      = document.getElementById("sobrenome").value.trim();
  const email          = document.getElementById("email").value.trim();
  const senha          = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;

// ── VALIDAÇÕES NO FRONTEND ─────────────────────

  if (!nome || !sobrenome) {
    alert("Preencha seu nome e sobrenome.");
    return;
  }

  if (!email) {
    alert("Preencha seu e-mail.");
    return;
  }

  if (senha.length < 6) {
    alert("A senha deve ter ao menos 6 caracteres.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

    // ── ENVIAR PARA O BACKEND ──────────────────────

  try {
    btnCadastrar.disabled = true;
    btnCadastrar.textContent = "Criando conta...";
 
    const resposta = await fetch("http://localhost:3000/api/auth/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, sobrenome, email, senha }),
    });
 
    const dados = await resposta.json();
 
    if (!resposta.ok) {
      alert(dados.erro || "Erro ao criar conta.");
      return;
    }
 
    alert(`Conta criada com sucesso! Bem-vindo(a), ${dados.usuario.nome}.`);
    window.location.href = "../index.html";
 
  } catch (erro) {
    alert("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
  } finally {
    btnCadastrar.disabled = false;
    btnCadastrar.textContent = "Criar conta";
  }

});
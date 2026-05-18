// Gerador de frases aleatorias para a tela de login

const frases = [
  "Cada grande evento começa com um simples agendamento, mas é a organização que transforma momentos comuns em experiências inesquecíveis.",
  "Planejar com antecedência é o primeiro passo para garantir eventos organizados, tranquilos e cheios de momentos especiais para todos.",
  "Eventos bem organizados nascem de agendas bem estruturadas, porque cada detalhe faz diferença na experiência final das pessoas.",
  "Uma boa organização transforma ideias em eventos memoráveis, criando experiências únicas desde o primeiro agendamento realizado no sistema.",
  "Seu próximo grande evento pode começar agora, com um agendamento simples, rápido e organizado em poucos minutos."
];

const fraseAleatoria =
  frases[Math.floor(Math.random() * frases.length)];

document.getElementById("frase").textContent = fraseAleatoria;

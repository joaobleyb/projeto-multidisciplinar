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

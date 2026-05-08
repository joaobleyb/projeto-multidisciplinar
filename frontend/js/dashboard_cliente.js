/* ============================================================
   dashboard_cliente.js
   - Sidebar toggle
   - Filtros de período
   - Dark / Light theme
   - Navegação de data (dia / semana / mês)
   - Modal: Início + Fim (duração real)
   - Drag-to-select: clica e arrasta para baixo para criar evento
   - Drag & Drop: arrasta evento para mover
   - Tooltip ao hover
   - Evento ocupa visualmente múltiplas células (position:absolute)
============================================================ */

// ─── ESTADO ──────────────────────────────────────────────────
let dataAtual   = new Date();      // data exibida atualmente no calendário
let visaoAtual  = 'day';           // visão ativa: 'day', 'week' ou 'month'
// Estrutura de cada evento: { id, nome, horaInicio, horaFim, col, cor, data }
let eventos     = [];
let dragEvento  = null;            // evento sendo movido via drag & drop

// Estado do drag-to-select (criar evento arrastando)
let selecionando       = false;
let inicioSelecaoIdx   = null;
let colunaSelecao      = null;
let dataSelecao        = null;
let previewSelecao     = null;     // div de preview visual durante o arraste

// ─── UTILIDADES ──────────────────────────────────────────────

/** Atalho para document.getElementById */
const $ = id => document.getElementById(id);

/** Retorna a data no formato "YYYY-MM-DD" (chave única por dia) */
function chaveData(d) { return d.toISOString().slice(0, 10); }

/**
 * Formata a data para exibição no cabeçalho do calendário,
 * de acordo com a visão ativa (dia, semana ou mês).
 */
function formatarLabelData(d, visao) {
  if (visao === 'day')
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  if (visao === 'week') {
    const inicio = inicioDaSemana(d);
    const fim = new Date(inicio); fim.setDate(fim.getDate() + 6);
    return `${inicio.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${fim.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/**
 * Retorna a segunda-feira da semana à qual a data `d` pertence.
 */
function inicioDaSemana(d) {
  const dia = d.getDay();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - dia + (dia === 0 ? -6 : 1));
}

/**
 * Gera um array de slots de tempo (ex: "08:00", "08:30") entre
 * as horas startH (inclusive) e endH (exclusive).
 */
function gerarSlots(startH, endH) {
  const s = [];
  for (let h = startH; h < endH; h++) {
    s.push(`${String(h).padStart(2, '0')}:00`);
    s.push(`${String(h).padStart(2, '0')}:30`);
  }
  return s;
}

// Slots agrupados por período do dia
const PERIODOS = {
  manha: gerarSlots(6, 12),
  tarde: gerarSlots(12, 18),
  noite: gerarSlots(18, 24),
};
// Todos os slots do dia em sequência
const TODOS_SLOTS = [...PERIODOS.manha, ...PERIODOS.tarde, ...PERIODOS.noite];

/** Retorna o índice numérico de um slot "HH:MM" dentro de TODOS_SLOTS */
function indiceSlot(slot) { return TODOS_SLOTS.indexOf(slot); }

/** Retorna o slot ("HH:MM") correspondente a um índice */
function slotNoIndice(i) { return TODOS_SLOTS[i] || null; }

/**
 * Retorna o próximo slot após o informado.
 * Usado para calcular o slot de fim exclusivo de um intervalo.
 */
function proximoSlot(slot) {
  const i = indiceSlot(slot);
  return TODOS_SLOTS[i + 1] || null;
}

// Altura visual de uma célula em pixels (usada para calcular posição do preview)
const ALTURA_CELULA = 40;

// ─── SIDEBAR ─────────────────────────────────────────────────
const sidebar        = $('sidebar');
const sidebarToggle  = $('sidebarToggle');
const sidebarOverlay = $('sidebarOverlay');

// Abre/fecha a sidebar ao clicar no botão hamburguer
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('active');
});

// Fecha a sidebar ao clicar no overlay (fundo escurecido)
sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
});

/* ─── FILTROS DE PERÍODO ─────────────────────────────────── */
// Alterna a exibição dos blocos de período (manhã, tarde, noite) ao clicar nos botões de filtro
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const bloco = $(btn.dataset.bloco);
    btn.classList.toggle('active');
    if (bloco) bloco.classList.toggle('hidden');
  });
});

// ─── NAVEGAÇÃO ───────────────────────────────────────────────
$('btnPrev').addEventListener('click',  () => navegar(-1));
$('btnNext').addEventListener('click',  () => navegar(1));
$('btnToday').addEventListener('click', () => { dataAtual = new Date(); renderizar(); });

/**
 * Avança ou recua a data exibida conforme a visão ativa.
 * @param {number} dir - Direção: 1 (avançar) ou -1 (voltar)
 */
function navegar(dir) {
  if (visaoAtual === 'day')        dataAtual.setDate(dataAtual.getDate() + dir);
  else if (visaoAtual === 'week')  dataAtual.setDate(dataAtual.getDate() + dir * 7);
  else                             dataAtual.setMonth(dataAtual.getMonth() + dir);
  renderizar();
}

// ─── VIEW SWITCHER ────────────────────────────────────────────
// Troca a visão ativa (dia/semana/mês) ao clicar nos botões de visão
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    visaoAtual = btn.dataset.view;
    renderizar();
  });
});

// ─── RENDER PRINCIPAL ─────────────────────────────────────────

/**
 * Função central de renderização.
 * Atualiza o label de data e exibe o grid correto conforme a visão ativa.
 */
function renderizar() {
  $('dateLabel').textContent = formatarLabelData(dataAtual, visaoAtual);
  $('viewDay').classList.toggle('hidden',   visaoAtual !== 'day');
  $('viewWeek').classList.toggle('hidden',  visaoAtual !== 'week');
  $('viewMonth').classList.toggle('hidden', visaoAtual !== 'month');

  if (visaoAtual === 'day')   renderizarDia();
  if (visaoAtual === 'week')  renderizarSemana();
  if (visaoAtual === 'month') renderizarMes();
}

// ─── VIEW: DIA ────────────────────────────────────────────────

/**
 * Renderiza a visão de dia, separando os slots em três grids:
 * manhã, tarde e noite.
 */
function renderizarDia() {
  const chave = chaveData(dataAtual);
  renderizarGridPeriodo('gridManha', PERIODOS.manha, chave);
  renderizarGridPeriodo('gridTarde', PERIODOS.tarde,  chave);
  renderizarGridPeriodo('gridNoite', PERIODOS.noite,  chave);
}

/**
 * Renderiza um grid de período (manhã/tarde/noite) com seus slots e colunas.
 * Cria as células de hora e configura drag-to-select e drop target em cada uma.
 * @param {string} gridId  - ID do elemento grid no DOM
 * @param {string[]} slots - Array de slots do período (ex: ["06:00","06:30",...])
 * @param {string} chaveD  - Chave da data atual no formato "YYYY-MM-DD"
 */
function renderizarGridPeriodo(gridId, slots, chaveD) {
  const grid = $(gridId);
  grid.innerHTML = '';
  // Posição relativa necessária para sobrepor eventos com position:absolute
  grid.style.position = 'relative';

  slots.forEach(slot => {
    const ehMeia = slot.endsWith(':30');

    // Célula de label de hora (ex: "08:00")
    const horaDiv = document.createElement('div');
    horaDiv.className = ehMeia ? 'hora meia' : 'hora';
    horaDiv.textContent = slot;
    grid.appendChild(horaDiv);

    // 5 colunas de agendamento por slot
    for (let col = 1; col <= 5; col++) {
      const celula = document.createElement('div');
      celula.className     = ehMeia ? 'celula meia' : 'celula';
      celula.dataset.hora  = slot;
      celula.dataset.col   = col;
      celula.dataset.date  = chaveD;

      configurarCelulaArrasteSeleção(celula, slot, col, chaveD);
      configurarCelulaDropTarget(celula);

      grid.appendChild(celula);
    }
  });

  // Delegação de evento: trata o clique no botão "✕" de exclusão de qualquer evento do grid
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.ev-delete-btn');
    if (!btn) return;
    e.stopPropagation();
    const id = Number(btn.dataset.id);
    eventos = eventos.filter(ev => ev.id !== id);
    renderizar();
  });

  // Renderiza os eventos sobrepostos (position:absolute) sobre as células
  renderizarOverlayEventos(grid, slots, chaveD);
}

// ─── OVERLAY DE EVENTOS (multi-slot) ─────────────────────────

/**
 * Renderiza os eventos como divs absolutas sobre o grid,
 * ocupando visualmente múltiplos slots conforme sua duração.
 * @param {Element} grid   - Elemento do grid no DOM
 * @param {string[]} slots - Slots do período deste grid
 * @param {string} chaveD  - Chave da data no formato "YYYY-MM-DD"
 */
function renderizarOverlayEventos(grid, slots, chaveD) {
  // Remove overlays de renderizações anteriores
  grid.querySelectorAll('.ev-overlay').forEach(e => e.remove());

  // Monta um índice rápido: slot → célula DOM de cada coluna
  // Estrutura: mapaCell[slot][col] = elemento .celula
  const mapaCell = {};
  grid.querySelectorAll('.celula').forEach(cel => {
    const h = cel.dataset.hora;
    const c = cel.dataset.col;
    if (!mapaCell[h]) mapaCell[h] = {};
    mapaCell[h][c] = cel;
  });

  const gridRect = grid.getBoundingClientRect();

  eventos
    .filter(ev => ev.data === chaveD)
    .forEach(ev => {
      const idxInicio = indiceSlot(ev.horaInicio);
      const idxFim    = indiceSlot(ev.horaFim); // fim exclusivo
      if (idxInicio === -1) return;

      // Verifica se o evento pertence ao intervalo deste grid
      const idxGridInicio = indiceSlot(slots[0]);
      const idxGridFim    = indiceSlot(slots[slots.length - 1]);

      if (idxInicio > idxGridFim || idxFim <= idxGridInicio) return;

      // Recorta o evento para não ultrapassar os limites do grid
      const inicioRecortado = Math.max(idxInicio, idxGridInicio);
      const fimRecortado    = Math.min(idxFim, idxGridFim + 1);
      const duracaoSlots    = fimRecortado - inicioRecortado;
      if (duracaoSlots <= 0) return;

      // ── Posicionamento via getBoundingClientRect ──────────────────
      // Célula do slot de início (linha do evento neste grid)
      const slotInicio = slotNoIndice(inicioRecortado);
      // Célula do slot de fim − 1 (última linha ocupada)
      const slotFim    = slotNoIndice(fimRecortado - 1);
      const col        = String(ev.col);

      const celInicio = mapaCell[slotInicio]?.[col];
      const celFim    = mapaCell[slotFim]?.[col];
      if (!celInicio || !celFim) return;

      const rInicio = celInicio.getBoundingClientRect();
      const rFim    = celFim.getBoundingClientRect();

      // Coordenadas relativas ao grid (que é position:relative)
      const MARGEM = 2; // px de respiro interno para não encostar na borda
      const top    = rInicio.top  - gridRect.top  + MARGEM;
      const left   = rInicio.left - gridRect.left + MARGEM;
      const width  = rInicio.width  - MARGEM * 2;
      const height = (rFim.bottom - rInicio.top) - MARGEM * 2;

      const tag = document.createElement('div');
      tag.className     = 'evento-tag ev-overlay';
      tag.style.cssText = `
        top:${top}px; left:${left}px;
        width:${width}px; height:${height}px;
        background:${ev.cor};
        position:absolute;
        border-radius:6px;
        padding:4px 8px;
        font-size:11px; font-weight:700; color:#fff;
        overflow:hidden; z-index:4; cursor:grab;
        display:flex; flex-direction:column; gap:2px;
        box-shadow:0 2px 8px rgba(0,0,0,0.18);
        user-select:none;
      `;
      tag.innerHTML = `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;gap:2px;padding:0 20px 0 4px;">
          <span style="font-size:12px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">${ev.nome}</span>
          <span style="font-size:10px;opacity:0.85">${ev.horaInicio} – ${ev.horaFim}</span>
        </div>
        <button class="ev-delete-btn" data-id="${ev.id}" title="Excluir">✕</button>
      `;
      tag.draggable  = true;
      tag.dataset.id = ev.id;

      // Inicia o drag & drop ao começar a arrastar o evento
      tag.addEventListener('dragstart', e => {
        dragEvento = ev;
        setTimeout(() => tag.classList.add('dragging'), 0);
        e.dataTransfer.effectAllowed = 'move';
      });
      tag.addEventListener('dragend', () => tag.classList.remove('dragging'));

      // Exibe/move/esconde o tooltip ao passar o mouse sobre o evento
      tag.addEventListener('mouseenter', e => exibirTooltip(e, ev));
      tag.addEventListener('mousemove',  e => moverTooltip(e));
      tag.addEventListener('mouseleave', esconderTooltip);

      // Abre o modal de edição ao clicar no evento (exceto no botão excluir)
      tag.addEventListener('click', e => {
        e.stopPropagation();
        if (e.target.classList.contains('ev-delete-btn')) return;
        abrirModal({}, ev);
      });

      // Controla a visibilidade do botão "✕" ao passar o mouse
      tag.addEventListener('mouseenter', () => {
        const btn = tag.querySelector('.ev-delete-btn');
        if (btn) btn.style.opacity = '1';
      });
      tag.addEventListener('mouseleave', () => {
        const btn = tag.querySelector('.ev-delete-btn');
        if (btn) btn.style.opacity = '0';
      });

      grid.appendChild(tag);
    });
}

// ─── DRAG-TO-SELECT (criar evento por arraste) ──────────────────────

/**
 * Configura os eventos de mousedown/mouseenter/mouseup em uma célula
 * para permitir criar um novo evento arrastando o mouse sobre múltiplos slots.
 * @param {Element} celula - Elemento da célula no DOM
 * @param {string} slot    - Horário do slot (ex: "08:00")
 * @param {number} col     - Número da coluna (1–5)
 * @param {string} chaveD  - Chave da data no formato "YYYY-MM-DD"
 */
function configurarCelulaArrasteSeleção(celula, slot, col, chaveD) {
  // Inicia a seleção ao pressionar o botão do mouse
  celula.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (e.target.classList.contains('evento-tag')) return;
    e.preventDefault();

    selecionando     = true;
    inicioSelecaoIdx = indiceSlot(slot);
    colunaSelecao    = col;
    dataSelecao      = chaveD;

    // Cria o elemento visual de preview da seleção
    previewSelecao = document.createElement('div');
    previewSelecao.className = 'select-preview';
    previewSelecao.style.cssText = `
      position:absolute; z-index:10; pointer-events:none;
      background:rgba(59,109,243,0.25); border:2px solid #3b6df3;
      border-radius:6px;
    `;
    celula.closest('.agenda').appendChild(previewSelecao);
    atualizarPreviewSelecao(celula.closest('.agenda'), inicioSelecaoIdx, inicioSelecaoIdx + 1, col);
  });

  // Atualiza o preview ao arrastar para outros slots da mesma coluna
  celula.addEventListener('mouseenter', () => {
    if (!selecionando || colunaSelecao != col) return;
    const idxAtual = indiceSlot(slot);
    const idxFim   = Math.max(idxAtual + 1, inicioSelecaoIdx + 1);
    atualizarPreviewSelecao(celula.closest('.agenda'), inicioSelecaoIdx, idxFim, col);
  });

  // Finaliza a seleção e abre o modal com o intervalo selecionado
  celula.addEventListener('mouseup', e => {
    if (!selecionando) return;
    if (colunaSelecao != col) { cancelarSelecao(); return; }

    const idxAtual  = indiceSlot(slot);
    const idxFim    = Math.max(idxAtual, inicioSelecaoIdx);

    const horaInicio = slotNoIndice(inicioSelecaoIdx);
    const horaFim    = slotNoIndice(idxFim + 1) || slotNoIndice(idxFim); // fim exclusivo

    cancelarSelecao();
    abrirModal({ horaInicio, horaFim, col, data: chaveD });
  });
}

/**
 * Atualiza a posição e tamanho do div de preview de seleção no grid.
 * @param {Element} grid     - Elemento do grid contêiner
 * @param {number} idxInicio - Índice do slot de início
 * @param {number} idxFim    - Índice do slot de fim (exclusivo)
 * @param {number} col       - Coluna sobre a qual o preview é desenhado
 */
function atualizarPreviewSelecao(grid, idxInicio, idxFim, col) {
  if (!previewSelecao || !grid) return;

  // Busca as células de início e fim pelo slot e coluna diretamente no DOM
  const slotIni = slotNoIndice(idxInicio);
  const slotFim = slotNoIndice(Math.max(idxFim - 1, idxInicio));
  if (!slotIni || !slotFim) return;

  const celIni = grid.querySelector(`.celula[data-hora="${slotIni}"][data-col="${col}"]`);
  const celFim = grid.querySelector(`.celula[data-hora="${slotFim}"][data-col="${col}"]`);
  if (!celIni || !celFim) return;

  const gridRect = grid.getBoundingClientRect();
  const rIni     = celIni.getBoundingClientRect();
  const rFim     = celFim.getBoundingClientRect();

  const MARGEM = 2;
  previewSelecao.style.top    = `${rIni.top  - gridRect.top  + MARGEM}px`;
  previewSelecao.style.left   = `${rIni.left - gridRect.left + MARGEM}px`;
  previewSelecao.style.width  = `${rIni.width  - MARGEM * 2}px`;
  previewSelecao.style.height = `${(rFim.bottom - rIni.top) - MARGEM * 2}px`;
}

/**
 * Cancela a seleção em andamento e remove o preview visual.
 */
function cancelarSelecao() {
  selecionando = false;
  if (previewSelecao) { previewSelecao.remove(); previewSelecao = null; }
  inicioSelecaoIdx = null;
  colunaSelecao    = null;
  dataSelecao      = null;
}

// Cancela a seleção se o mouse for solto fora de qualquer célula
document.addEventListener('mouseup', () => { if (selecionando) cancelarSelecao(); });

// ─── DROP TARGET (mover evento via drag & drop) ───────────────────────────────

/**
 * Configura uma célula como alvo de drop para receber eventos arrastados.
 * Ao soltar, reposiciona o evento mantendo sua duração original.
 * @param {Element} celula - Elemento da célula no DOM
 */
function configurarCelulaDropTarget(celula) {
  celula.addEventListener('dragover',  e => { e.preventDefault(); celula.classList.add('drag-over'); });
  celula.addEventListener('dragleave', () => celula.classList.remove('drag-over'));
  celula.addEventListener('drop', e => {
    e.preventDefault();
    celula.classList.remove('drag-over');
    if (!dragEvento) return;
    // Mantém a duração original do evento ao reposicionar
    const duracao         = indiceSlot(dragEvento.horaFim) - indiceSlot(dragEvento.horaInicio);
    dragEvento.data       = celula.dataset.date;
    dragEvento.horaInicio = celula.dataset.hora;
    const novoIdxFim      = indiceSlot(celula.dataset.hora) + duracao;
    dragEvento.horaFim    = slotNoIndice(novoIdxFim) || slotNoIndice(TODOS_SLOTS.length - 1);
    dragEvento.col        = celula.dataset.col;
    dragEvento = null;
    renderizar();
  });
}

// ─── VIEW: SEMANA ─────────────────────────────────────────────

/**
 * Renderiza a visão de semana.
 * Monta o grid com 7 colunas (uma por dia) e uma linha por slot de tempo.
 * Exibe os eventos de cada dia no topo da célula correspondente ao horário de início.
 */
function renderizarSemana() {
  const weekGrid = $('weekGrid');
  weekGrid.innerHTML = '';

  const inicioSemana = inicioDaSemana(dataAtual);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemana); d.setDate(d.getDate() + i); return d;
  });

  const chavehoje = chaveData(new Date());
  const DIAS_PT   = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Cabeçalho vazio (canto superior esquerdo, acima do label de hora)
  weekGrid.appendChild(Object.assign(document.createElement('div'), { className: 'week-day-header' }));

  // Cabeçalhos dos dias (Dom, Seg... com a data)
  dias.forEach(d => {
    const h = document.createElement('div');
    h.className = 'week-day-header' + (chaveData(d) === chavehoje ? ' today' : '');
    h.innerHTML = `<span>${DIAS_PT[d.getDay()]}</span><br><b>${d.getDate()}</b>`;
    weekGrid.appendChild(h);
  });

  // Linhas de slots com células para cada dia
  TODOS_SLOTS.forEach(slot => {
    const ehMeia = slot.endsWith(':30');
    const h = document.createElement('div');
    h.className   = ehMeia ? 'week-hora meia' : 'week-hora';
    h.textContent = slot;
    weekGrid.appendChild(h);

    dias.forEach(d => {
      const celula = document.createElement('div');
      celula.className    = ehMeia ? 'week-celula meia' : 'week-celula';
      const dk = chaveData(d);
      celula.dataset.date = dk;
      celula.dataset.hora = slot;
      celula.dataset.col  = '1';

      // Exibe eventos que iniciam neste slot/dia
      const evsDoDia = eventos.filter(ev => ev.data === dk && ev.horaInicio === slot);
      evsDoDia.forEach(ev => {
        const tag = document.createElement('div');
        tag.style.cssText = `background:${ev.cor};border-radius:4px;padding:2px 5px;font-size:10px;font-weight:700;color:#fff;margin:1px 0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;cursor:pointer`;
        tag.textContent   = `${ev.nome} (${ev.horaInicio}-${ev.horaFim})`;
        tag.addEventListener('mouseenter', e => exibirTooltip(e, ev));
        tag.addEventListener('mousemove',  e => moverTooltip(e));
        tag.addEventListener('mouseleave', esconderTooltip);
        celula.appendChild(tag);
      });

      // Abre modal de criação ao clicar na célula vazia
      celula.addEventListener('click', e => {
        if (e.target !== celula) return;
        abrirModal({ horaInicio: slot, horaFim: proximoSlot(slot) || slot, col: 1, data: dk });
      });

      // Configura a célula como alvo de drop para reposicionamento
      celula.addEventListener('dragover',  e => { e.preventDefault(); celula.classList.add('drag-over'); });
      celula.addEventListener('dragleave', () => celula.classList.remove('drag-over'));
      celula.addEventListener('drop', e => {
        e.preventDefault(); celula.classList.remove('drag-over');
        if (!dragEvento) return;
        dragEvento.data       = dk;
        dragEvento.horaInicio = slot;
        dragEvento = null; renderizar();
      });

      weekGrid.appendChild(celula);
    });
  });
}

// ─── VIEW: MÊS ───────────────────────────────────────────────

/**
 * Renderiza a visão de mês.
 * Monta um grid de calendário com 7 colunas e inclui dias de meses adjacentes
 * para completar as semanas parciais.
 */
function renderizarMes() {
  const monthGrid = $('monthGrid');
  monthGrid.innerHTML = '';

  // Cabeçalho com os nomes dos dias da semana
  ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(d => {
    monthGrid.appendChild(Object.assign(document.createElement('div'), { className: 'month-day-name', textContent: d }));
  });

  const ano         = dataAtual.getFullYear();
  const mes         = dataAtual.getMonth();
  const diaSemanaInicio = new Date(ano, mes, 1).getDay();    // dia da semana do 1º do mês
  const diasNoMes   = new Date(ano, mes + 1, 0).getDate();   // total de dias no mês
  const chavehoje   = chaveData(new Date());

  // Dias do mês anterior para completar a primeira semana
  for (let i = 0; i < diaSemanaInicio; i++)
    adicionarCelulaDoMes(monthGrid, new Date(ano, mes, -diaSemanaInicio + i + 1), true, chavehoje);

  // Dias do mês atual
  for (let d = 1; d <= diasNoMes; d++)
    adicionarCelulaDoMes(monthGrid, new Date(ano, mes, d), false, chavehoje);

  // Dias do próximo mês para completar a última semana
  const restante = (diaSemanaInicio + diasNoMes) % 7;
  if (restante > 0)
    for (let d = 1; d <= 7 - restante; d++)
      adicionarCelulaDoMes(monthGrid, new Date(ano, mes + 1, d), true, chavehoje);
}

/**
 * Cria e adiciona uma célula de dia ao grid do mês.
 * Exibe os eventos do dia e permite criar um novo evento ao clicar.
 * @param {Element} grid       - Elemento do grid do mês
 * @param {Date}    data       - Data correspondente à célula
 * @param {boolean} outroMes  - Se true, o dia pertence ao mês anterior ou posterior
 * @param {string}  chavehoje - Chave da data de hoje para destaque visual
 */
function adicionarCelulaDoMes(grid, data, outroMes, chavehoje) {
  const chave = chaveData(data);
  const celula = document.createElement('div');
  celula.className = 'month-cell' + (outroMes ? ' other-month' : '') + (chave === chavehoje ? ' today' : '');

  const numDia = document.createElement('div');
  numDia.className = 'month-day-num'; numDia.textContent = data.getDate();
  celula.appendChild(numDia);

  // Renderiza os eventos do dia como etiquetas coloridas
  eventos.filter(ev => ev.data === chave).forEach(ev => {
    const tag = document.createElement('div');
    tag.className        = 'month-evento';
    tag.style.background = ev.cor;
    tag.textContent      = `${ev.nome} ${ev.horaInicio}–${ev.horaFim}`;
    tag.addEventListener('mouseenter', e => exibirTooltip(e, ev));
    tag.addEventListener('mousemove',  e => moverTooltip(e));
    tag.addEventListener('mouseleave', esconderTooltip);
    celula.appendChild(tag);
  });

  // Abre o modal de criação ao clicar na célula ou no número do dia
  celula.addEventListener('click', e => {
    if (e.target !== celula && e.target.className !== 'month-day-num') return;
    abrirModal({ data: chave, horaInicio: '08:00', horaFim: '09:00' });
  });
  grid.appendChild(celula);
}

// ─── TOOLTIP ─────────────────────────────────────────────────
const tooltip = $('eventoTooltip');

/**
 * Exibe o tooltip com as informações do evento próximo ao cursor.
 * @param {MouseEvent} e  - Evento de mouse
 * @param {Object}     ev - Objeto do evento a ser exibido
 */
function exibirTooltip(e, ev) {
  tooltip.innerHTML = `
    <strong><span class="tip-dot" style="background:${ev.cor}"></span>${ev.nome}</strong>
    🕐 ${ev.horaInicio} – ${ev.horaFim}<br>
    📍 Sala: Col ${ev.col}<br>
    📅 ${ev.data}
  `;
  tooltip.style.display = 'block';
  moverTooltip(e);
}

/** Reposiciona o tooltip para seguir o cursor do mouse. */
function moverTooltip(e) {
  tooltip.style.left = (e.clientX + 14) + 'px';
  tooltip.style.top  = (e.clientY + 14) + 'px';
}

/** Esconde o tooltip. */
function esconderTooltip() { tooltip.style.display = 'none'; }

// ─── MODAL ───────────────────────────────────────────────────
const modalOverlay = $('modalOverlay');
let   contextoModal = {};
let   idEditando    = null;

// Popula os selects de hora com todos os slots disponíveis
['inputHoraInicio', 'inputHoraFim'].forEach(id => {
  const sel = $(id);
  TODOS_SLOTS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    sel.appendChild(opt);
  });
  // Adiciona 00:00 como opção de fim (meia-noite)
  const opt = document.createElement('option');
  opt.value = '00:00'; opt.textContent = '00:00';
  sel.appendChild(opt);
});

// Seleção de cor: marca a cor clicada como selecionada
document.querySelectorAll('.color-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

/**
 * Abre o modal para criar um novo evento ou editar um existente.
 * @param {Object}      ctx - Contexto inicial (horaInicio, horaFim, col, data)
 * @param {Object|null} ev  - Evento existente a editar, ou null para criação
 */
function abrirModal(ctx = {}, ev = null) {
  contextoModal = ctx;
  idEditando    = ev ? ev.id : null;

  $('modalTitle').textContent       = ev ? 'Editar Evento' : 'Novo Evento';
  $('btnExcluir').style.display     = ev ? 'flex' : 'none';
  $('inputNome').value              = ev ? ev.nome : '';

  const ini = ev ? ev.horaInicio : (ctx.horaInicio || '08:00');
  const fim = ev ? ev.horaFim    : (ctx.horaFim    || '09:00');
  $('inputHoraInicio').value = ini;
  $('inputHoraFim').value    = fim;

  if (ctx.col || ev?.col) $('inputCol').value = ev ? ev.col : ctx.col;

  // Pré-seleciona a cor do evento (ou a cor padrão azul)
  const cor = ev?.cor || '#3b6df3';
  document.querySelectorAll('.color-opt').forEach(o => {
    o.classList.toggle('selected', o.dataset.color === cor);
  });

  modalOverlay.classList.add('open');
  setTimeout(() => $('inputNome').focus(), 200);
}

/** Fecha o modal de criação/edição de eventos. */
function fecharModal() { modalOverlay.classList.remove('open'); }

// Abre o modal para criar evento no dia atual
$('btnAddEvento').addEventListener('click', () =>
  abrirModal({ data: chaveData(dataAtual), horaInicio: '08:00', horaFim: '09:00' })
);
$('modalClose').addEventListener('click',   fecharModal);
$('btnCancelar').addEventListener('click',  fecharModal);
// Fecha o modal ao clicar fora dele (no overlay)
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) fecharModal(); });

// Exclui o evento em edição ao clicar em "Excluir"
$('btnExcluir').addEventListener('click', () => {
  if (!idEditando) return;
  eventos = eventos.filter(e => e.id !== idEditando);
  fecharModal();
  renderizar();
});

// Salva o evento (criação ou edição) ao clicar em "Salvar"
$('btnSalvar').addEventListener('click', () => {
  const nome = $('inputNome').value.trim();
  if (!nome) { $('inputNome').focus(); return; }

  const horaInicio = $('inputHoraInicio').value;
  const horaFim    = $('inputHoraFim').value;
  const cor        = document.querySelector('.color-opt.selected')?.dataset.color || '#3b6df3';
  const col        = $('inputCol').value;
  const data       = contextoModal.data || chaveData(dataAtual);

  // Valida que o horário de fim é posterior ao de início
  if (indiceSlot(horaFim) !== -1 && indiceSlot(horaInicio) !== -1 &&
      indiceSlot(horaFim) <= indiceSlot(horaInicio)) {
    $('inputHoraFim').style.borderColor = '#ef4444';
    setTimeout(() => $('inputHoraFim').style.borderColor = '', 1500);
    return;
  }

  if (idEditando) {
    // Atualiza evento existente
    const ev = eventos.find(e => e.id === idEditando);
    if (ev) Object.assign(ev, { nome, horaInicio, horaFim, col, cor, data });
  } else {
    // Cria novo evento
    eventos.push({ id: Date.now(), nome, horaInicio, horaFim, col, cor, data });
  }

  fecharModal();
  renderizar();
});

// ─── INIT ─────────────────────────────────────────────────────
// Renderização inicial ao carregar a página
renderizar();
// Re-posiciona os overlays quando o layout muda de tamanho
// (ex: sidebar abrindo/fechando, redimensionamento da janela)
window.addEventListener('resize', () => {
  if (visaoAtual === 'day') renderizarDia();
});

// Observa mudança de tamanho no container principal (sidebar toggle, etc.)
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(() => {
    if (visaoAtual === 'day') renderizarDia();
  }).observe(document.querySelector('.main'));
}
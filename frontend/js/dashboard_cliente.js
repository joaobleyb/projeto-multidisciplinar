function filtrar(idBloco, botao) {
    const bloco = document.getElementById(idBloco);
    
    if (bloco.style.display === 'none') {
        bloco.style.display = 'block';
        botao.classList.add('active');
    } else {
        bloco.style.display = 'none';
        botao.classList.remove('active');
    }
}
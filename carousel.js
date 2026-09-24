// Carrossel infinito - Julianna & Guilherme
// Funciona com qualquer quantidade de fotos dentro de #bloco-carrossel.
// Para adicionar mais fotos, basta incluir mais <img> dentro de
// <div id="bloco-carrossel"> no HTML - nada aqui precisa ser alterado.

(function () {
    const carrossel = document.getElementById('carrossel');
    const janela = document.getElementById('janela-carrossel');
    const bloco = document.getElementById('bloco-carrossel');
    const btnAnterior = document.getElementById('carrossel-anterior');
    const btnProximo = document.getElementById('carrossel-proximo');

    if (!carrossel || !janela || !bloco) return;

    // Precisa bater com o "gap" definido em #bloco-carrossel no CSS
    const GAP = 20;
    const LIMIAR_ARRASTE = 0.2; // % do "passo" necessário para trocar de foto

    const slidesOriginais = Array.from(bloco.children);
    const totalOriginais = slidesOriginais.length;
    if (totalOriginais === 0) return;

    // Clona todas as fotos e adiciona uma cópia antes e outra depois,
    // criando o efeito de rolagem infinita.
    slidesOriginais.forEach((slide) => {
        const clone = slide.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('draggable', 'false');
        bloco.appendChild(clone);
    });

    [...slidesOriginais].reverse().forEach((slide) => {
        const clone = slide.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('draggable', 'false');
        bloco.insertBefore(clone, bloco.firstChild);
    });

    slidesOriginais.forEach((slide) => slide.setAttribute('draggable', 'false'));

    let indice = totalOriginais; // começa na primeira foto "real"
    let animando = false;
    let arrastando = false;
    let posInicial = 0;
    let deslocamentoAtual = 0;

    function itensPorTela() {
        const valor = getComputedStyle(carrossel).getPropertyValue('--carrossel-itens');
        const n = parseFloat(valor);
        return n && n > 0 ? n : 1;
    }

    function passo() {
        const largura = janela.getBoundingClientRect().width;
        return (largura + GAP) / itensPorTela();
    }

    function irPara(novoIndice, comTransicao) {
        bloco.style.transition = comTransicao ? 'transform 0.45s ease' : 'none';
        deslocamentoAtual = -novoIndice * passo();
        bloco.style.transform = 'translateX(' + deslocamentoAtual + 'px)';
        indice = novoIndice;
    }

    function proximo() {
        if (animando) return;
        animando = true;
        irPara(indice + 1, true);
    }

    function anterior() {
        if (animando) return;
        animando = true;
        irPara(indice - 1, true);
    }

    // Quando a transição termina, se estivermos numa foto clonada,
    // "teleportamos" sem transição para a foto real equivalente.
    bloco.addEventListener('transitionend', () => {
        animando = false;
        if (indice >= totalOriginais * 2) {
            irPara(indice - totalOriginais, false);
        } else if (indice < totalOriginais) {
            irPara(indice + totalOriginais, false);
        }
    });

    window.addEventListener('resize', () => {
        irPara(indice, false);
    });

    if (btnProximo) btnProximo.addEventListener('click', proximo);
    if (btnAnterior) btnAnterior.addEventListener('click', anterior);

    function iniciarArraste(x) {
        arrastando = true;
        animando = false;
        posInicial = x;
        bloco.style.transition = 'none';
        janela.classList.add('arrastando');
    }

    function moverArraste(x) {
        if (!arrastando) return;
        const delta = x - posInicial;
        bloco.style.transform = 'translateX(' + (deslocamentoAtual + delta) + 'px)';
    }

    function finalizarArraste(x) {
        if (!arrastando) return;
        arrastando = false;
        janela.classList.remove('arrastando');
        const delta = x - posInicial;
        const limite = passo() * LIMIAR_ARRASTE;

        if (delta <= -limite) {
            proximo();
        } else if (delta >= limite) {
            anterior();
        } else {
            animando = true;
            irPara(indice, true);
        }
    }

    // Arraste com o mouse
    janela.addEventListener('mousedown', (e) => {
        e.preventDefault();
        iniciarArraste(e.clientX);
    });
    window.addEventListener('mousemove', (e) => moverArraste(e.clientX));
    window.addEventListener('mouseup', (e) => finalizarArraste(e.clientX));

    // Suporte a toque, para celular/tablet
    janela.addEventListener('touchstart', (e) => iniciarArraste(e.touches[0].clientX), { passive: true });
    janela.addEventListener('touchmove', (e) => moverArraste(e.touches[0].clientX), { passive: true });
    janela.addEventListener('touchend', (e) => finalizarArraste(e.changedTouches[0].clientX));

    // Posição inicial, sem transição
    irPara(indice, false);
})();

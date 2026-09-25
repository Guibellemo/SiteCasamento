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

    const GAP = 20; // precisa bater com o "gap" definido em #bloco-carrossel no CSS
    const LIMIAR_ARRASTE = 0.15; // % da largura de uma foto para considerar "arrastou de verdade"
    const LIMIAR_EIXO = 8; // px de movimento necessários para decidir se é arraste horizontal ou rolagem vertical

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
    let posInicialX = 0;
    let posInicialY = 0;
    let deslocamentoInicial = 0;
    let tipoPonteiro = null;
    let eixoBloqueado = null; // 'x' (arraste do carrossel) ou 'y' (deixa a página rolar)

    // Mede a distância real (em px) entre o início de uma foto e o início
    // da próxima, direto no que está renderizado na tela. Evita depender
    // de contas de padding/gap que podem variar no responsivo.
    function passo() {
        const slides = bloco.children;
        if (slides.length < 2) return janela.getBoundingClientRect().width + GAP;
        return slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left;
    }

    // Lê a posição real (em px) em que o carrossel está na tela agora,
    // mesmo que uma transição ainda esteja em andamento.
    function translateAtual() {
        const valor = getComputedStyle(bloco).transform;
        if (!valor || valor === 'none') return 0;
        const numeros = valor.match(/matrix.*\((.+)\)/);
        if (!numeros) return 0;
        const partes = numeros[1].split(', ');
        return valor.startsWith('matrix3d') ? parseFloat(partes[12]) : parseFloat(partes[4]);
    }

    function irPara(novoIndice, comTransicao) {
        bloco.style.transition = comTransicao ? 'transform 0.45s ease' : 'none';
        bloco.style.transform = 'translateX(' + (-novoIndice * passo()) + 'px)';
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

    // ---- Arraste (mouse e toque, via Pointer Events) ----

    janela.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return; // só botão esquerdo do mouse

        arrastando = true;
        animando = false;
        tipoPonteiro = e.pointerType;
        posInicialX = e.clientX;
        posInicialY = e.clientY;
        // No mouse já sabemos que é arraste horizontal; no toque, só decidimos
        // depois de ver pra qual lado o dedo se move (ver pointermove).
        eixoBloqueado = tipoPonteiro === 'touch' ? null : 'x';

        // Congela o carrossel exatamente onde ele está visualmente,
        // cancelando qualquer transição em andamento, e resincroniza o índice.
        deslocamentoInicial = translateAtual();
        bloco.style.transition = 'none';
        bloco.style.transform = 'translateX(' + deslocamentoInicial + 'px)';
        indice = Math.round(-deslocamentoInicial / passo());

        janela.setPointerCapture(e.pointerId);
        janela.classList.add('arrastando');
    });

    janela.addEventListener('pointermove', (e) => {
        if (!arrastando) return;
        const dx = e.clientX - posInicialX;

        if (tipoPonteiro === 'touch' && eixoBloqueado === null) {
            const dy = e.clientY - posInicialY;
            if (Math.abs(dx) < LIMIAR_EIXO && Math.abs(dy) < LIMIAR_EIXO) return; // ainda indeciso

            eixoBloqueado = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
            if (eixoBloqueado === 'y') {
                // O dedo está rolando a página pra cima/baixo: solta o carrossel
                // e deixa o navegador fazer a rolagem normal.
                arrastando = false;
                janela.classList.remove('arrastando');
                return;
            }
        }

        // A partir daqui é um arraste horizontal: impede a página de rolar
        // enquanto o dedo/mouse move a foto.
        e.preventDefault();
        bloco.style.transform = 'translateX(' + (deslocamentoInicial + dx) + 'px)';
    }, { passive: false });

    function finalizarArraste(e) {
        if (!arrastando) return;
        arrastando = false;
        janela.classList.remove('arrastando');

        const delta = e.clientX - posInicialX;
        const limite = passo() * LIMIAR_ARRASTE;

        if (delta <= -limite) {
            proximo();
        } else if (delta >= limite) {
            anterior();
        } else if (Math.abs(delta) < 5) {
            // Foi basicamente um toque/clique: lado esquerdo volta, lado direito avança.
            const rect = janela.getBoundingClientRect();
            const cliqueX = e.clientX - rect.left;
            animando = true;
            irPara(cliqueX < rect.width / 2 ? indice - 1 : indice + 1, true);
        } else {
            // Arrastou pouco: volta pra foto atual.
            animando = true;
            irPara(indice, true);
        }
    }

    janela.addEventListener('pointerup', finalizarArraste);
    janela.addEventListener('pointercancel', finalizarArraste);

    // Posição inicial, sem transição
    irPara(indice, false);
})();
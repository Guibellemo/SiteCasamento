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

    // Mede a distância real (em px) entre o início de uma foto e o início
    // da próxima, direto no que está renderizado na tela. Isso evita
    // depender de contas de padding/gap que podem variar no responsivo.
    function passo() {
        const slides = bloco.children;
        if (slides.length < 2) return janela.getBoundingClientRect().width + GAP;
        return slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left;
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

    // Clique/toque na própria foto: lado esquerdo volta, lado direito avança.
    janela.addEventListener('click', (e) => {
        const rect = janela.getBoundingClientRect();
        const cliqueX = e.clientX - rect.left;
        if (cliqueX < rect.width / 2) {
            anterior();
        } else {
            proximo();
        }
    });

    // Posição inicial, sem transição
    irPara(indice, false);
})();
// =========================================
// CONTROLE DE ÁUDIO DE FUNDO
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('musica-fundo');
    const btnMutar = document.getElementById('btn-mutar');
    const controleVolume = document.getElementById('controle-volume');

    if (!audio || !btnMutar || !controleVolume) return;

    // Define o volume inicial conforme o slider
    audio.volume = controleVolume.value;

    // Tenta tocar a música assim que o usuário interagir com a página
    const iniciarAudio = () => {
        if (audio.paused) {
            audio.play().catch(erro => {
                console.log("O autoplay foi bloqueado até que haja interação.");
            });
        }
        // Remove os event listeners após a primeira interação para não ficar chamando o .play() à toa
        document.removeEventListener('click', iniciarAudio);
        document.removeEventListener('touchstart', iniciarAudio);
    };
    
    document.addEventListener('click', iniciarAudio);
    document.addEventListener('touchstart', iniciarAudio);

    // Botão de Mutar / Desmutar
    btnMutar.addEventListener('click', () => {
        if (audio.muted || audio.volume === 0) {
            audio.muted = false;
            // Se o slider estava no 0, volta para a metade
            if (controleVolume.value == 0) {
                controleVolume.value = 0.5;
            }
            audio.volume = controleVolume.value;
            btnMutar.textContent = audio.volume < 0.5 ? '🔉' : '🔊';
        } else {
            audio.muted = true;
            btnMutar.textContent = '🔇';
        }
    });

    // Slider de Volume
    controleVolume.addEventListener('input', (e) => {
        const novoVolume = parseFloat(e.target.value);
        audio.volume = novoVolume;
        
        if (novoVolume === 0) {
            audio.muted = true;
            btnMutar.textContent = '🔇';
        } else {
            audio.muted = false;
            // Altera o ícone dependendo de quão alto está o volume
            btnMutar.textContent = novoVolume < 0.5 ? '🔉' : '🔊';
        }
    });
});
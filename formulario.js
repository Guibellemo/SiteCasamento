document.getElementById('form-presenca').addEventListener('submit', function() {
    // Pegamos o botão
    const botaoSubmit = this.querySelector('input[type="submit"]');
    
    // Mudamos o texto para dar um feedback de que está processando
    botaoSubmit.value = "Enviando..."; 
    
    // Atenção: NÃO usamos e.preventDefault() aqui.
    // O navegador vai enviar o formulário normalmente e seguir
    // o link que vamos colocar no x-sheetmonkey-redirect.
});
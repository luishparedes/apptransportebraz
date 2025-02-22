document.getElementById('enterButton').addEventListener('click', function() {
    const url = 'https://luishparedes.github.io/transportebranzweb/'; // Reemplaza con tu URL

    try {
        window.open(url, '_system');
    } catch (error) {
        console.error("Error al abrir la URL:", error);
        alert("Hubo un problema al abrir el enlace. Por favor, inténtalo de nuevo.");
    }
});

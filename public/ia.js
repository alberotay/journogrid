$(document).ready(function () {
    let summary = ""; // Variable que contendrá el resumen
    const epsButton = $('#epsButton');

    // Función para obtener el resumen de la IA desde el servidor
    function fetchSummary() {
        $.get('/api/getSummary', function (data) {
            summary = data.summary; // Asignar el valor de summary desde el backend
            if (summary.trim() !== "") {
                epsButton.prop('disabled', false); // Habilitar el botón si hay resumen
            } else {
                epsButton.prop('disabled', true); // Deshabilitar el botón si no hay resumen
            }
        });
    }

    // Ejecutar la función para obtener el resumen al cargar la página
    fetchSummary();

    // Si el resumen está disponible, mostrarlo al hacer clic en el botón
    epsButton.on('click', function () {
        if (summary.trim() !== "") {
            alert(summary); // Mostrar el resumen en una ventana emergente
        }
    });

    // También puedes configurar el botón para que se actualice cada vez que la variable summary cambie
    setInterval(fetchSummary, 300000); // Reconsultar el resumen cada 5 minutos
});
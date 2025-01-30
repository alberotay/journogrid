// script.js

// Función para obtener la fecha y hora actual en el formato deseado
function obtenerFechaHoraActual() {
    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Se suma 1 porque los meses comienzan desde 0
    const anio = fecha.getFullYear();
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia} de ${obtenerNombreMes(mes)} de ${anio} - ${hora}:${minutos}`;
}

// Función para obtener el nombre del mes en español
function obtenerNombreMes(numeroMes) {
    const nombresMeses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return nombresMeses[parseInt(numeroMes, 10) - 1];
}

// Actualizar la fecha y hora al cargar la página
window.addEventListener('load', function () {
    const ultimaActualizacion = document.getElementById('ultima-actualizacion');
    ultimaActualizacion.textContent = 'Última actualización | ' + obtenerFechaHoraActual();
});
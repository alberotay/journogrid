// Variables para controlar el scroll
const columnIntervals = {}; // Objeto para almacenar intervalos por columna

function moveNewsUp(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    clearInterval(columnIntervals[containerId]);

    const $downButtons = $(container).closest('.news-container').find('.move-down-button');
    $downButtons.removeClass('active');

    container.scrollTop = 0; // Establecer scrollTop a 0 para ir al inicio del contenedor
}


function moveNewsDown(containerId, button) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const columnId = container.closest('.news-container').id;
    if (!columnId) return;

    const newsItems = container.querySelectorAll('.news-item');

    // Inicializar columnIntervals si no existe
    window.columnIntervals = window.columnIntervals || {};

    // Obtener currentItemIndex de columnIntervals o inicializarlo a 0
    let currentItemIndex = columnIntervals[columnId] && columnIntervals[columnId].currentItemIndex || 0;

    if (columnIntervals[columnId]) {
        clearInterval(columnIntervals[columnId].intervalId); // Detener el intervalo
        delete columnIntervals[columnId]; // Eliminar la información del intervalo
        button.classList.remove('active');
        return;
    }

    if (button) {
        button.classList.add('active');
    }

    function scrollStep() {
        if (currentItemIndex < newsItems.length) {
            const currentDiv = newsItems[currentItemIndex];
            container.scrollTo({
                top: currentDiv.offsetTop - 85,
                behavior: 'smooth'
            });
            currentItemIndex++;
        } else {
            scrollStep();
        }
    }

    // Guardar el intervalo y currentItemIndex en columnIntervals
    columnIntervals[columnId] = {
        intervalId: setInterval(scrollStep, 3000),
        currentItemIndex: currentItemIndex
    };

    button.removeEventListener('click', stopScroll);
    button.addEventListener('click', stopScroll);

    function stopScroll() {
        if (columnIntervals[columnId]) {
            clearInterval(columnIntervals[columnId].intervalId);
            columnIntervals[columnId].currentItemIndex = currentItemIndex; // Guardar el índice actual
            button.classList.remove('active');
            button.removeEventListener('click', stopScroll);
        }
    }
}
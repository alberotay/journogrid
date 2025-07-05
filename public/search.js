// ==============================
// search.js
// Módulo de búsqueda avanzada en el frontend de JournoGrid
// Permite buscar noticias por rango de fechas y palabra clave
// ==============================

// Evento: Al hacer clic en el botón de búsqueda
document.getElementById('searchButton').addEventListener('click', async () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const keyword = document.getElementById('searchInput').value.trim(); // Captura la palabra clave

    
// Valida que ambas fechas estén seleccionadas antes de buscar
    if (startDate && endDate) {
        try {
            // Hace una petición a la API backend, pasando las fechas y la palabra clave como parámetros
            const response = await fetch(`/api/search?startDate=${startDate}&endDate=${endDate}&keyword=${encodeURIComponent(keyword)}`);
            const data = await response.json();
            displayResults(data);// Llama a la función que pinta los resultados en pantalla
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    } else {
        alert('Por favor, selecciona ambas fechas.');
    }
});

// ==============================
// displayResults
// Renderiza los artículos encontrados en el contenedor de resultados
// ==============================

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Limpiar contenido previo

    data.forEach(item => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article'); // Clase para estilos

        // Crear la estructura del artículo
        articleDiv.innerHTML = `
            <div class="article-card">
                <div class="article-header">
                    <img src="${item.thumbnailUrl}" alt="Imagen no disponible" class="article-image">
                </div>
                <div class="article-content">
                    <h2 class="article-title">${item.title}</h2>
                    <p class="article-meta">${item.source} | ${formatDate(item.pubDate)}</p>
                    <p class="article-description">${item.description}<a href="${item.link}" target="_blank" class="article-link-button"><i class="bi bi-eye"></i></a></p>
                    
                </div>
            </div>
        `;

        resultsContainer.appendChild(articleDiv);
    });
}

// Función para formatear la fecha
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

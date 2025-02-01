document.getElementById('searchButton').addEventListener('click', async () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const keyword = document.getElementById('searchInput').value.trim(); // Captura la palabra clave

    

    if (startDate && endDate) {
        try {
            const response = await fetch(`/api/search?startDate=${startDate}&endDate=${endDate}&keyword=${encodeURIComponent(keyword)}`);
            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    } else {
        alert('Por favor, selecciona ambas fechas.');
    }
});

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // 💡 Mueve esto aquí, dentro de la función.

    data.forEach(item => {
        const div = document.createElement('div');
        div.textContent = `${item.title} - ${item.pubDate}`;
        resultsContainer.appendChild(div);
    });
}

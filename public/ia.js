//////////ZORRITO LOGO////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const zorritoImg = document.getElementById("zorrito");

    // Tiempo total de ciclo (en milisegundos)
    const totalCycleTime = 6000;  // 6 segundos por ciclo completo
    const openTime = 2000;         // 2 segundos con los ojos abiertos
    const blinkDuration = 200;     // 1/4 de segundo por parpadeo (cerrado y abierto)
    
    // Lógica para el parpadeo doble
    const handleBlinking = () => {
        // Primer fase: 2 segundos con los ojos abiertos
        zorritoImg.src = "logos/zorritoIAB1.svg"; // Ojos abiertos
        setTimeout(() => {
            // Segundo fase: 1/4 de segundo con los ojos cerrados
            zorritoImg.src = "logos/zorritoIAB2.svg"; // Ojos cerrados
            setTimeout(() => {
                // Tercera fase: 1/4 de segundo con los ojos abiertos
                zorritoImg.src = "logos/zorritoIAB1.svg"; // Ojos abiertos
                setTimeout(() => {
                    // Cuarta fase: 1/4 de segundo con los ojos cerrados
                    zorritoImg.src = "logos/zorritoIAB2.svg"; // Ojos cerrados
                    setTimeout(() => {
                        // Quinta fase: 2 segundos con los ojos abiertos nuevamente
                        zorritoImg.src = "logos/zorritoIAB1.svg"; // Ojos abiertos
                    }, openTime); // 2 segundos más de ojos abiertos
                }, blinkDuration); // 1/4 segundo de ojos cerrados
            }, blinkDuration); // 1/4 segundo de ojos abiertos
        }, blinkDuration); // 1/4 segundo de ojos cerrados
    };

    // Iniciar la animación
    setInterval(handleBlinking, totalCycleTime);
});




///////////ia texto////////////////


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
            // Colocar el resumen en el modal
            $('#modalSummaryContent').text(summary); 
            // Mostrar el modal
            $('#summaryModal').modal('show');
        }
    });
    // También puedes configurar el botón para que se actualice cada vez que la variable summary cambie
    setInterval(fetchSummary, 200000); // Reconsultar el resumen cada 5 minutos
});


///////////////////AUDIO IA //////////////////////////////

document.addEventListener("DOMContentLoaded", async () => {
    const playButton = document.getElementById("playAudioBtn");
    const audioPlayer = document.getElementById("audioPlayer");

    // Chequeo automático cada 30 segundos
    async function checkAudioAvailability() {
        try {
            const response = await fetch("/api/getVoice", { method: "HEAD" }); // Solo verifica si la API devuelve algo
            if (response.ok) {
                playButton.disabled = false; // Activa el botón
                playButton.classList.add("enabled"); // Clase CSS para resaltar si quieres
                console.log("🔊 Audio disponible");
            } else {
                playButton.disabled = true;
                playButton.classList.remove("enabled");
                console.log("❌ Audio no disponible");
            }
        } catch (error) {
            console.error("Error al comprobar el audio:", error);
            playButton.disabled = true;
        }
    }

    // Reproducir audio al hacer clic
    playButton.addEventListener("click", () => {
        const audioSource = audioPlayer.querySelector("source");

        // Forzar que siempre se obtenga una versión nueva del audio agregando un parámetro aleatorio
        const timestamp = new Date().getTime(); // Obtiene el tiempo actual como timestamp
        audioSource.src = `/api/getVoice?timestamp=${timestamp}`; // Agrega un parámetro de timestamp

        // Recargamos y reproducimos el audio
        audioPlayer.load();
        audioPlayer.play();
    });

    // Llamada inicial y cada 30 segundos
    checkAudioAvailability();
    setInterval(checkAudioAvailability, 90000);
});

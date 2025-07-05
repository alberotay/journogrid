// ==============================
// redisWrapper.js
// Módulo de acceso a la caché Redis para noticias
// Se encarga de almacenar y recuperar las noticias más recientes en la caché
// ==============================

const redisClient = require("./connection") // Importa el cliente Redis ya conectado 
const MINS_TO_REQUEST_ALL_RSS = 5;   // Tiempo de vida de la caché en minutos (igual que el refresco de los feeds)

exports.fillNewsCache =  function (lastNews){
    redisClient.set(
        'LAST_NEWS',                 // Clave de la caché
        JSON.stringify(lastNews),    // Serializa las noticias como JSON
        {
        EX: MINS_TO_REQUEST_ALL_RSS * 60, // Tiempo de expiración en segundos
    });
}

// ==============================
// getNewsCache
// Recupera el array de noticias almacenado en la caché Redis bajo la clave 'LAST_NEWS'
// Devuelve el array ya parseado o null si no existe o hay error
// ==============================

exports.getNewsCache = async function () {
    let stringLastNews = await redisClient.get('LAST_NEWS'); // Obtiene la cadena JSON de Redis

    if (stringLastNews) {
        try {
            return JSON.parse(stringLastNews);
        } catch (error) {
            console.error("Error parsing JSON from Redis:", error);
            return null; // Si hay error al parsear, devuelve null
        }
    } else {
        return null;    // Si la clave no existe, devuelve null
    }
};



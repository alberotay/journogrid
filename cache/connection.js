const redis = require('redis'); // Importar Redis
// ==============================
// connection.js (carpeta cache)
// Establece la conexión con el servidor Redis
// Utiliza la URL definida en las variables de entorno
// ==============================
const REDIS_URL = process.env.REDIS_URL; // Obtiene la URL/host de Redis de las variables de entorno
const redisClient = redis.createClient({
    url: REDIS_URL, // Cambiar si tienes otra configuración de Redis
});
// Evento para capturar y mostrar errores de conexión o de operaciones en Redis
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect()
// Exporta el cliente para que otros módulos puedan usar Redis en toda la aplicación
module.exports = redisClient;
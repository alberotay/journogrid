const redis = require('redis'); // Importar Redis
const REDIS_URL = process.env.REDIS_URL;
const redisClient = redis.createClient({
    url: REDIS_URL, // Cambiar si tienes otra configuración de Redis
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect()

module.exports = redisClient;
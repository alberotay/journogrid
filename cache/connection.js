const redis = require('redis'); // Importar Redis
const redisClient = redis.createClient({
<<<<<<< HEAD
    url: 'redis://host.docker.internal:6379', // Conexion REDIS
=======
    url: 'redis://host.docker.internal:6379', // Cambiar si tienes otra configuración de Redis
>>>>>>> advancedSearch
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect()

module.exports = redisClient;
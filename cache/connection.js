const redis = require('redis'); // Importar Redis
const redisClient = redis.createClient({
    url: 'redis://host.docker.internal:6379', // Conexion REDIS
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect()

module.exports = redisClient;
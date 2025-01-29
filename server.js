const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const feedItems = require('./feeds/feed');
const feedsConfig = require('./feeds/feedsConfig');
const utils = require('./utils');
const redis = require('redis'); // Importar Redis
const mongoConnect = require('./db/connection'); // Archivo de conexión a MongoDB
mongoConnect();

const MINS_TO_REQUEST_ALL_RSS = 5;

// Configuración de Redis
const redisClient = redis.createClient({
    url: 'redis://host.docker.internal:6379', // Cambiar si tienes otra configuración de Redis
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

// Configuración inicial del servidor
app.use(express.static('public'));
app.use(cors());

let LAST_NEWS = [];
let uniqueIPs = new Set();
let allFeedsItemGetters = [];
feedsConfig.feedConfig.forEach((config) => {
    let itemGetter = new feedItems(config[0], config[1], config[2]);
    allFeedsItemGetters.push(itemGetter);
});

// Función principal para procesar feeds y guardar en Redis
async function parserAll() {
    console.log('Procesando feeds...');
    let combinedFeed = [];
    for await (const feedItemGetter of allFeedsItemGetters) {
        await feedItemGetter.parseItems();
        let item = await feedItemGetter.getItems();
        if (item.allFeeds.length > 0) {
            combinedFeed.push(item);
        }
    }
    LAST_NEWS = combinedFeed;

    // Guardar las noticias en Redis con un tiempo de expiración
    try {
        await redisClient.set('LAST_NEWS', JSON.stringify(LAST_NEWS), {
            EX: MINS_TO_REQUEST_ALL_RSS * 60, // Tiempo de expiración en segundos
        });
        console.log('Noticias almacenadas en Redis');
    } catch (error) {
        console.error('Error al guardar en Redis:', error);
    }
}

// Ejecutar parserAll periódicamente
parserAll().then(() => console.log('Inicio inicial completo'));
setInterval(parserAll, 1000 * 60 * MINS_TO_REQUEST_ALL_RSS);

// Endpoint principal
app.get('/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Endpoint para devolver las noticias desde Redis
app.get('/rss', async (req, res) => {
    console.log('Petición RSS desde ' + req.ip);
    uniqueIPs.add(req.ip);
    console.log(`Total de direcciones IP únicas conectadas: ${uniqueIPs.size}`);

    try {
        // Intentar recuperar las noticias desde Redis
        const cachedNews = await redisClient.get('LAST_NEWS');
        if (cachedNews) {
            //console.log(cachedNewsy);
            console.log('Devolviendo noticias desde Redis');
            const parsedNews = JSON.parse(cachedNews);
            let lastView = req.query.lastView;
            let toSortForClient = parsedNews.slice();
            return res.send(utils.sortForClient(toSortForClient, lastView));
        } else {
            console.log('Redis vacío, ejecutando flujo de respaldo');
            let combinedFeed = [];
            for (const feedItemGetter of allFeedsItemGetters) {
                let item = await feedItemGetter.getItems();
                if (item.allFeeds.length > 0) {
                    combinedFeed.push(item);
                }
            }
            LAST_NEWS = combinedFeed;
            res.send(utils.sortForClient(LAST_NEWS.slice(), req.query.lastView));
        }
    } catch (error) {
        console.error('Error al procesar RSS:', error);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
});

// Endpoint para depuración
app.get('/debug/last-news', (req, res) => {
    res.json(LAST_NEWS);
    console.log('http://localhost:3000/debug/last-news');
});

// Endpoint para devolver todos los elementos disponibles
app.get('/all-items', async (req, res) => {
    try {
        let allItems = [];
        for (const feedItemGetter of allFeedsItemGetters) {
            await feedItemGetter.getItems();
            allItems = allItems.concat(feedItemGetter.elements);
        }
        res.json({
            success: true,
            totalItems: allItems.length,
            items: allItems,
        });
    } catch (error) {
        console.error('Error al obtener los items:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los items' });
    }
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});

const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const feedsDecorator = require('./feeds/feedsDecorator')
app.use(express.static('public'));
app.use(cors());
let uniqueIPs = new Set();


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
    res.send(await feedsDecorator.getNewsFromCache())

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
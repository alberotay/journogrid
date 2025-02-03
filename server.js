const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors')
const bodyParser = require('body-parser');
const feedsDecorator = require('./feeds/feedsDecorator')
app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let uniqueIPs = new Set();


// Endpoint principal
app.get('/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Endpoint para devolver las noticias desde Redis
app.get('/api/rss', async (req, res) => {
    console.log('Petición RSS desde ' + req.ip);
    uniqueIPs.add(req.ip);
    console.log(`Total de direcciones IP únicas conectadas: ${uniqueIPs.size}`);
    res.send(await feedsDecorator.getNewsFromCache())

});

app.get('/admin', async (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'admin.html'));
});
app.get('/advancedSearch', async (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'advancedSearch.html'));
});

app.get('/api/search', async (req, res) => {
    const { startDate, endDate, keyword } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Faltan fechas de inicio y fin." });
    }

    try {
        console.log(`📅 Buscando noticias entre ${startDate} y ${endDate}`);
        
        // Creamos el filtro con las fechas
        const query = {
            pubDate: {
                $gte: new Date(startDate), 
                $lte: new Date(endDate)
            }
        };
        if (keyword) {
            query.title = { $regex: keyword, $options: "i" }; // Búsqueda insensible a mayúsculas/minúsculas
        }

        // Asegúrate de que feedsDecorator.getDataNews devuelva una promesa que resuelve con las noticias
        const news = await feedsDecorator.getDataNews(query);

        console.log(`✅ ${news.length} noticias encontradas`);

        // Devolvemos las noticias en formato JSON
        res.json(news);
    } catch (error) {
        console.error('❌ Error en /api/search:', error);
        res.status(500).json({ error: error.message });
    }
});



app.get('/api/getAllRss', async (req, res) => {
    res.send(await feedsDecorator.getAllRss());
});

app.post('/api/setRss', async (req, res) => {
     feedsDecorator.storeRss(req.body)
    res.send("ok")
});

app.post('/api/deleteRss', async (req, res) => {
    feedsDecorator.deleteRss(req.body.source)
    res.send("ok")
});


app.get('/api/getAllCategories', async (req, res) => {
    res.send(await feedsDecorator.getAllCategories());
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});

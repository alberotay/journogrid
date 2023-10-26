const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const feedItems = require('./feeds/feed')
const feedsConfig = require('./feeds/feedsConfig')
const utils = require('./utils')


let MINS_TO_REQUEST_ALL_RSS = 5

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(express.static('public')); // Sirve archivos estáticos desde la carpeta 'public'
// Habilita CORS para todas las rutas
app.use(cors());

let LAST_NEWS = []
parserAll().then(() => console.log("Initial Start"))
setInterval(parserAll, 1000 * 60 * MINS_TO_REQUEST_ALL_RSS)

let uniqueIPs = new Set()

let allFeedsItemGetters = []
feedsConfig.feedConfig.forEach((config) => {
    let itemGetter = new feedItems(config[0], config[1], config[2])
    allFeedsItemGetters.push(itemGetter)
})

//let newYorkRimesFeedItems = new feedItems("newYorkTimes",true,'https://rss.nytimes.com/services/xml/rss/nyt/World.xml')

async function parserAll() {
    await utils.sleep(100)
    let combinedFeed = []
    for await (const feedItemGetter of allFeedsItemGetters) {
        //console.log("updateing item Getter")
        let item = await feedItemGetter.getItems()
        if (item.allFeeds.length > 0) {
            combinedFeed.push(item)
        }
    }
    LAST_NEWS = combinedFeed;
}

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
})

app.get('/rss', (req, res) => {
    console.log('LLEGA PETICION RSS DESDE ' + req.ip )
    uniqueIPs.add(req.ip)
    // Imprimir el total de direcciones IP únicas
    console.log(`Total de direcciones IP únicas conectadas: ${uniqueIPs.size}`);


    let lastView = req.query.lastView
    let toSortForClient = LAST_NEWS.slice()


    res.setHeader('Access-Control-Allow-Origin', '*'); // Habilita CORS para cualquier origen
    res.setHeader('Access-Control-Allow-Methods', 'GET'); // Define los métodos permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Define los encabezados permitidos
    res.send(utils.sortForClient(toSortForClient,lastView))


});

app.listen(80, () => {
    console.log('Servidor iniciado en el puerto 80');
});

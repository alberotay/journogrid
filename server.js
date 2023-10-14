const express = require('express');
const app = express();

const cors = require('cors');
const laVanguardiaItems = require('./feeds/laVanguardia.js')
const araItems = require('./feeds/ara.js')
const dailyItems = require('./feeds/daily.js')
const abcItems = require('./feeds/elAbc.js')
const elMinItems = require('./feeds/elMin.js')
const elMonItems = require('./feeds/elMon.js')
const elMundoItems = require('./feeds/elMundo.js')
const elNacionalItems = require('./feeds/elNacional.js')
const elPaisItems = require('./feeds/elPais.js')
const elPeriodicoItems = require('./feeds/elPeriodico.js')
const elPuntAvuiItems = require('./feeds/elPuntAvui.js')
const eNoticiesItems = require('./feeds/eNoticies.js')
const europaItems = require('./feeds/europa.js')
const nDigitalItems = require('./feeds/NDigital.js')


//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(express.static('public')); // Sirve archivos estáticos desde la carpeta 'public'
// Habilita CORS para todas las rutas
app.use(cors());

let LAST_NEWS = []
parserAll()
let MINS_TO_REQUEST_ALL_RSS = 1
setInterval(parserAll, 1000*60*MINS_TO_REQUEST_ALL_RSS)


async function parserAll() {

    let combinedFeed =[]
        combinedFeed.push(await elMundoItems.getItems())
        combinedFeed.push(await laVanguardiaItems.getItems())
        combinedFeed.push(await araItems.getItems())
        combinedFeed.push(await dailyItems.getItems())
        combinedFeed.push(await abcItems.getItems())
        combinedFeed.push(await elMinItems.getItems())
        combinedFeed.push(await elMonItems.getItems())
        combinedFeed.push(await elNacionalItems.getItems())
        combinedFeed.push(await elPaisItems.getItems())
        combinedFeed.push(await elPeriodicoItems.getItems())
        combinedFeed.push(await elPuntAvuiItems.getItems())
        combinedFeed.push(await eNoticiesItems.getItems())
        combinedFeed.push(await europaItems.getItems())
        combinedFeed.push(await nDigitalItems.getItems())
        LAST_NEWS = combinedFeed;

        require('./utils.js').updateDate()

}

app.get('/rss', (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*'); // Habilita CORS para cualquier origen
    res.setHeader('Access-Control-Allow-Methods', 'GET'); // Define los métodos permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Define los encabezados permitidos

    res.send(LAST_NEWS)


});

app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});

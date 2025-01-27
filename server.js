const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const feedItems = require('./feeds/feed')
const feedsConfig = require('./feeds/feedsConfig')
const utils = require('./utils')
//Implementacion BD
const connectDB = require('./db'); // Archivo de conexión a MongoDB
const News = require('./models/news'); // Modelo de noticias
//Fin declaracion BD

// Conexión a MongoDB
connectDB();


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
            //IMPLEMENTACION  APPEND  A BBBDD
            // Guardar las noticias en la base de datos
            for (const news of item.allFeeds) {
                try {
                    // Evitar duplicados mediante `link` como único
                    await News.updateOne(
                        { link: news.link }, // Condición
                        {
                            $set: {
                                title: news.title,
                                link: news.link,
                                pubDate: news.pubDate,
                                source: news.source,
                                category: news.category,
                                thumbnailUrl:news.thumbnailUrl,
                                description:news.description,
                            },
                        },
                        { upsert: true } // Inserta si no existe
                    );
                } catch (error) {
                    console.error('Error al guardar noticia:', error.message);
                }
            }
      

           //CIERRE IMPLEMENTACION 

        }
    }
    
    LAST_NEWS = combinedFeed;
}

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
})

app.get('/rss', async(req, res) => {
    console.log('LLEGA PETICION RSS DESDE ' + req.ip )
    uniqueIPs.add(req.ip)
    // Imprimir el total de direcciones IP únicas
    console.log(`Total de direcciones IP únicas conectadas: ${uniqueIPs.size}`);

    
    
    
    //ANTIGUA IMPLEMENTACION POR VARIABLE
    //let lastView = req.query.lastView
    //let toSortForClient = LAST_NEWS.slice()
    //res.setHeader('Access-Control-Allow-Origin', '*'); // Habilita CORS para cualquier origen
    //res.setHeader('Access-Control-Allow-Methods', 'GET'); // Define los métodos permitidos
    //res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Define los encabezados permitidos
    //res.send(utils.sortForClient(toSortForClient,lastView))
    //CIERRE  ANTIGUO
    try {
        console.log('Valor de lastView recibido:', req.query.lastView);
    
        // Si no hay lastView, tomamos una fecha fija en el pasado
        let lastView;
        if (req.query.lastView) {
            lastView = new Date(Number(req.query.lastView));
        } else {
            // Hace 7 días como rango predeterminado para la primera conexión
            lastView = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }
    
        console.log('Fecha ajustada para lastView:', lastView);
    
        // Obtener noticias desde la base de datos
        let news = await News.find({ pubDate: { $gt: lastView } })
            .sort({ pubDate: -1 })
            .limit(10) // Limitar el número de noticias iniciales
            .exec();
    
        // Si no hay noticias después de lastView, intenta recuperar las más recientes
        if (news.length === 0) {
            console.log('No se encontraron noticias recientes. Recuperando noticias más antiguas...');
            news = await News.find({})
                .sort({ pubDate: -1 }) // Ordenar de más recientes a más antiguas
                .limit(10) // Limitar a las últimas 10 noticias
                .exec();
        }
    
        console.log('Noticias enviadas al cliente:', news);
    
        // Configuración de CORS y respuesta al cliente
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(news);
    } catch (error) {
        console.error('Error al obtener noticias:', error.message);
        res.status(500).json({ message: 'Error al obtener noticias' });
    }
    

});

app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});
//app.get('/debug/last-news', (req, res) => {
//    res.json(LAST_NEWS); // Devuelve el contenido de LAST_NEWS como JSON
//     //console.log('http://localhost:3000/debug/last-news'); VER TODO EN CONSOLA
//});

//app.get('/all-items', async (req, res) => {
//    try {
//       let allItems = []; // Lista de todos los items disponibles
//
//        for (const feedItemGetter of allFeedsItemGetters) {
//            // Asegúrate de llamar a getItems para llenar los elementos
//            await feedItemGetter.getItems();
//           // Agrega los elementos directamente a la lista
//            allItems = allItems.concat(feedItemGetter.elements);
//        }
//
//        // Responder con todos los elementos disponibles
//        res.json({
//            success: true,
//            totalItems: allItems.length,
//            items: allItems,
//        });
//    } catch (error) {
//        console.error("Error al obtener los items:", error);
//        res.status(500).json({ success: false, message: "Error al obtener los items" });
//    }
//});

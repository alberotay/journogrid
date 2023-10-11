const express = require('express');
const app = express();
const FeedParser = require('feedparser');
const request = require('request');
const cors = require('cors');
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(express.static('public')); // Sirve archivos estáticos desde la carpeta 'public'
// Habilita CORS para todas las rutas
app.use(cors());
const AraFeed = 'https://www.ara.cat/rss/';
const elMundoFeed = 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml';
const elPeriodicoFeed = 'https://www.elperiodico.com/es/rss/rss_portada.xml';
const laVanguardiaFeed = 'https://www.lavanguardia.com/rss/home.xml';
const elPaisFeed = 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada';
const elPuntAvuiFeed = 'https://www.elpuntavui.cat/barcelona/nacional.feed?type=rss';
const elAbcFeed = 'https://www.abc.es/rss/2.0/portada/';
const elMinFeed = 'https://www.20minutos.es/rss/';
const elNacionalFeed = 'https://www.elnacional.cat/uploads/feeds/feed_es.xml';
const NDigitalFeed = 'https://www.naciodigital.cat/rss/';
const eNotFeed = 'https://e-noticies.cat/rss/last-posts';
const elMonFeed = 'https://elmon.cat/es/feed';
const EuropaFeed = 'https://www.europapress.es/rss/rss.aspx?ch=284';
const DailyFeed = 'https://es.euronews.com/rss';

let LAST_NEWS

getNews()

setInterval(getNews,200000)



function getNews(){
    console.log("actualizando news!")
    try {








        // Función para parsear un feed y devolver los elementos
        const parseFeed = (feedUrl, isElMundo, isLaVanguardia, callback) => {
            const items = [];

            const req = request(feedUrl);
            const feedparser = new FeedParser();


            req.on('error', error => {
                console.error(error);
                callback([]);
            });

            req.on('response', function (res) {
                if (res.statusCode !== 200) {
                    this.emit('error', new Error('Bad status code'));
                } else {
                    this.pipe(feedparser);
                }
            });

            feedparser.on('error', error => {
                console.error(error);
                callback([]);
            });

            feedparser.on('readable', function () {
                const stream = this;
                let item;

                while ((item = stream.read())) {
                    if (isElMundo && item['media:thumbnail']) {
                        const thumbnailUrl = item['media:thumbnail']['@']['url'];
                        item.thumbnailUrl = thumbnailUrl;
                    } else if (isLaVanguardia && item.enclosures && item.enclosures[0].type === 'image/jpeg') {
                        const thumbnailUrl = item.enclosures[0].url;
                        item.thumbnailUrl = thumbnailUrl;
                    }

                    items.push(item);
                }
            });

            feedparser.on('end', () => {
                callback(items);
            });
        };

        // Parsear ambos feeds y combinar los resultados
        parseFeed(elMundoFeed, true, false, elMundoItems => {
            parseFeed(elPeriodicoFeed, false, false, elPeriodicoItems => {
                parseFeed(laVanguardiaFeed, false, true, laVanguardiaItems => {
                    parseFeed(elPaisFeed, false, false, elPaisItems => {
                        parseFeed(elPuntAvuiFeed, false, false, elPuntAvuiItems => {
                            parseFeed(elAbcFeed, false, false, elAbcItems => {
                                parseFeed(AraFeed, false, false, AraItems => {
                                    parseFeed(elMinFeed, false, false, elMinItems => {
                                        parseFeed(elNacionalFeed, false, false, elNacionalItems => {
                                            parseFeed(NDigitalFeed, false, false, NDigitalItems => {
                                                parseFeed(eNotFeed, false, false, eNotItems => {
                                                    parseFeed(elMonFeed, false, false, elMonItems => {

                                                        parseFeed(EuropaFeed, false, false, EuropaItems => {
                                                            parseFeed(DailyFeed, false, false, DailyItems => {


                                                                const combinedFeed = {
                                                                    elMundo: elMundoItems,
                                                                    elPeriodico: elPeriodicoItems,
                                                                    laVanguardia: laVanguardiaItems,
                                                                    elPais: elPaisItems,
                                                                    elPuntAvui: elPuntAvuiItems, // Añade los elementos parseados de El Punt Avui
                                                                    elAbc: elAbcItems,
                                                                    Ara: AraItems,
                                                                    elMin: elMinItems,
                                                                    elNacional: elNacionalItems,
                                                                    NDigital: NDigitalItems,
                                                                    eNot: eNotItems,
                                                                    elMon: elMonItems,
                                                                    Europa: EuropaItems,
                                                                    Daily: DailyItems
                                                                };
                                                                LAST_NEWS = combinedFeed;
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error(error);

    }

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

let categories = require('./feedCategories').CATEGORIES

let feedsConfig = [
    ["newYorkTimes",'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',categories.NATIONAL],
    ["elMundo",'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml',categories.NATIONAL],
    ["laVanguardia","https://www.lavanguardia.com/rss/home.xml",categories.NATIONAL],
    ["elAbc","https://www.abc.es/rss/2.0/portada/",categories.NATIONAL],
    ["20Minutos","https://www.20minutos.es/rss/",categories.INTERNATIONAL],
    ["ara","'https://www.ara.cat/rss/'",categories.INTERNATIONAL],
    ["elPeriodico","https://www.elperiodico.com/es/rss/rss_portada.xml",categories.INTERNATIONAL],
    ["elPuntAvui","https://www.elpuntavui.cat/barcelona/nacional.feed?type=rss",categories.INTERNATIONAL],
    ["elNacional","https://www.elnacional.cat/uploads/feeds/feed_es.xml",categories.INTERNATIONAL],
    ["eNoticies","https://e-noticies.cat/rss/last-posts",categories.INTERNATIONAL],
    ["elMon","https://elmon.cat/es/feed/",categories.INTERNATIONAL],
    ["elPais","https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",categories.ECONOMY],
    ["nacioDigital","https://www.naciodigital.cat/rss/",categories.ECONOMY],
    ["euronews","https://es.euronews.com/rss",categories.ECONOMY],
    ["europaPress","https://www.europapress.es/rss/rss.aspx?ch=284",categories.ECONOMY],
    ["sport","https://www.sport.es/es/rss/last-news/news.xml",categories.SPORTS],
    ["marca","https://e00-marca.uecdn.es/rss/portada.xml",categories.SPORTS],
    ["bbc",'https://www.bbc.com/mundo/ultimas_noticias/index.xml',categories.SPORTS],
    ["okDiario","https://okdiario.com/feed",categories.SPORTS]
]

exports.feedConfig=feedsConfig
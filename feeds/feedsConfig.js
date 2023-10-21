let categories = require('./feedCategories').CATEGORIES

let feedsConfig = [
    ["newYorkTimes", 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', categories.INTERNATIONAL],
    ["laVanguardia", "https://www.lavanguardia.com/rss/home.xml", categories.NATIONAL],
    ["elAbc", "https://www.abc.es/rss/2.0/portada/", categories.NATIONAL],
    ["20Minutos", "https://www.20minutos.es/rss/", categories.CATALONIA],
    ["ara", "'https://www.ara.cat/rss/'", categories.CATALONIA],
    ["elPeriodico", "https://www.elperiodico.com/es/rss/rss_portada.xml", categories.NATIONAL],
    ["elPuntAvui", "https://www.elpuntavui.cat/barcelona/nacional.feed?type=rss", categories.CATALONIA],
    ["elNacional", "https://www.elnacional.cat/uploads/feeds/feed_es.xml", categories.CATALONIA],
    ["eNoticies", "https://e-noticies.cat/rss/last-posts", categories.CATALONIA],
    ["elMon", "https://elmon.cat/es/feed/", categories.CATALONIA],
    ["elPais", "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada", categories.NATIONAL],
    ["nacioDigital", "https://www.naciodigital.cat/rss/", categories.CATALONIA],
    ["euronews", "https://es.euronews.com/rss", categories.INTERNATIONAL],
    ["europaPress", "https://www.europapress.es/rss/rss.aspx?ch=284", categories.AGENCY],
    ["sport", "https://www.sport.es/es/rss/last-news/news.xml", categories.SPORTS],
    ["marca", "https://e00-marca.uecdn.es/rss/portada.xml", categories.SPORTS],
    ["bbc", 'https://www.bbc.com/mundo/ultimas_noticias/index.xml', categories.INTERNATIONAL],
    ["okDiario", "https://okdiario.com/feed", categories.NATIONAL],
    ["as", "https://as.com/rss/tags/ultimas_noticias.xml", categories.SPORTS],
    ["washingtonpPost","https://feeds.washingtonpost.com/rss/national?itid=lk_inline_manual_32",categories.INTERNATIONAL],
    ["laTribuna","https://www.latribunadeciudadreal.es/RSS/TCRPortada.xml",categories.CASTILLALAMANCHA],
    ["elMundo","https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml",categories.NATIONAL]

]

exports.feedConfig = feedsConfig
const News = require('./mongoShcemas'); // Modelo de noticias

exports.storeNewsByArray = async function(newsArray){
    for (const news of newsArray) {
       try {
            // Evitar duplicados mediante `link` como único
             await News.updateOne(
                { id: news.id }, // Condición
                {
                    $set: {
                        id:news.id,
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
}


exports.getNewsBySource =  async function (source) {


    console.log("empezamosa buscar")
    // Hace 7 días como rango predeterminado para la primera conexión
    let lastView = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let news = await News.find( {source: source})
        .sort({pubDate: -1})
        .limit(100)
    return news
}
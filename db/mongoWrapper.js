const News = require('./mongoShcemas'); // Modelo de noticias
const mongoConnect = require('./connection'); // Archivo de conexión a MongoDB
mongoConnect();

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
            //console.error('Error al guardar noticia:', error.message);
        }
    }
}


exports.getNewsByFilter =  async function (filter) {
    return News.find(filter)
        .sort({pubDate: -1})
        .limit(100);
}
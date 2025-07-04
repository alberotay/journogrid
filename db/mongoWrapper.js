const News = require('./schemas/newsShcema'); // Modelo de noticias
const Rss = require('./schemas/rssShcema'); // Modelo de noticias
const Categories = require('./schemas/categoriesSchema');
const mongoConnect = require('./connection'); // Archivo de conexión a MongoDB
mongoConnect();





exports.storeNewsByArray = async function(newsArray){
    for (const news of newsArray) {
       try {
        // Log para ver qué noticia (y qué videoUrl) vas a guardar:
            if (news.videoUrl) {
                //console.log(`[storeNewsByArray] Guardando noticia con videoUrl: ${news.title} - ${news.videoUrl}`);
            }
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
                        videoUrl: news.videoUrl,
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
}
exports.setRss = async function (rss) {
    try {
        console.log("Datos rss:", rss);
        console.log("rss.source:", rss.source, typeof rss.source); // Verifica el valor y tipo

        const result = await Rss.updateOne(
            { source: rss.source }, // Busca por rss.source
            {
                $set: {
                    source: rss.source,
                    url: rss.url,        // Usa rss.url para el campo url
                    category: rss.category, // Usa rss.category para el campo category
                    isActive: rss.isActive,
                    maxElementsCache: parseInt(rss.maxElementsCache)
                },
            },
            { upsert: true, setDefaultsOnInsert: true }
        ).exec();

        console.log("Resultado de updateOne:", result);
    } catch (error) {
        console.error('Error al guardar noticia:', error.message);
    }
};

exports.getAllRss =  async function (filter) {
    return Rss.find(filter)
}

exports.deleteRssBySource =  async function (source) {
    return Rss.deleteOne({source:source})
}


exports.setCategory = async function (category){
        try {
             const result = await Categories.updateOne(
                { type: category.type }, // Busca por rss.source
                {
                    $set: {
                        type: category.type
                    },
                },
                { upsert: true, setDefaultsOnInsert: true }
            ).exec();
            console.log("Resultado de updateOne:", result);
        } catch (error) {
            console.error('Error al guardar categoria:', error.message);
        }
};

exports.getAllCategories = async function(){
    return Categories.find()
}

exports.deleteCategory = async function(type) {
    return await Categories.deleteOne({ type });
};
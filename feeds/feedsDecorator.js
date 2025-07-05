// ==============================
//  feedsDecorator.js
//  Orquestador de feeds RSS
//  - Coordina el ciclo completo de actualización y caché
//  - Gestiona parseo, normalización y almacenamiento en MongoDB y Redis
// ==============================

const feedItems = require('./feed');                    // Clase para representar y gestionar cada feed individual
//const feedsConfig = require('./feedsConfig');
const redisWrapper = require('../cache/redisWrapper');  // Módulo para gestión de caché Redis
const mongoWrapper = require('../db/mongoWrapper');     // Módulo para gestión de base de datos MongoDB


// ==============================
// 1. Inicialización: Primera carga de datos
// ==============================
populateData();

// ==============================
// 2. Timer periódico: Actualización cada 5 minutos
// ==============================
setInterval(populateData, 1000 * 60 * 5); // Parse and store every 5 minutes
//setInterval(fillCache, 1000 * 6000 * 0.1); //cada 10 segundos

// ==============================
// 3. Funciones principales para consulta de noticias
// ==============================
//Devuelve noticias desde MongoDB según el filtro recibido
exports.getDataNews = async function(filter) {
    return  await mongoWrapper.getNewsByFilter(filter)
}
//Recupera las noticias desde la caché Redis para máxima velocidad
exports.getNewsFromCache = async function() {
    const cachedResults = await redisWrapper.getNewsCache();
    console.log("Retrieving from cache");
    return cachedResults;
};

// ==============================
// 4. Ciclo completo: Recolectar, parsear, almacenar y cachear
// ==============================

/**
 * Función principal que actualiza las noticias:
 * 1. Descarga y parsea todas las fuentes RSS activas.
 * 2. Normaliza y almacena en MongoDB.
 * 3. Actualiza la caché de Redis con las noticias más recientes.
 */

async function populateData() {
    await parseAndStoreToMongo();   // Paso 1 y 2: Descarga y almacena en MongoDB
    await fillCache();              // Paso 3: Actualiza Redis con lo más reciente
}

/**
 * Para cada feed configurado:
 * - Descarga y parsea el RSS.
 * - Normaliza las noticias.
 * - Las guarda en MongoDB.
 */

async function parseAndStoreToMongo() {
    let allItemGetters = await getAllFeedItemGetters()
    await Promise.all(allItemGetters.map(feedItemGetter => feedItemGetter.parseItems()));
}

/**
 * Actualiza la caché Redis con las noticias más recientes de cada feed:
 * - Recupera las noticias desde MongoDB.
 * - Aplica el límite máximo de elementos a cachear por feed.
 * - Combina y guarda el resultado en Redis.
 */

async function fillCache() {
    let allItemGetters = await getAllFeedItemGetters()
    const results = await Promise.all(
        allItemGetters
            .filter(itemGetter => itemGetter.isActive)
            .map(feedItemGetter => feedItemGetter.getItems())
     );

    // Combina solo los feeds con elementos y respeta el límite de caché
    const combinedFeed = results.reduce((acc, item) => {
        if (item && item.allFeeds && item.allFeeds.length > 0) {
            item.allFeeds= item.allFeeds.slice(0, item.maxElementsCache);
            acc.push(item);
        }
        return acc;
    }, []);

    await redisWrapper.fillNewsCache(combinedFeed); // Await cache filling
    console.log("Cache filled");
}

//Genera una lista de instancias feedItems a partir de la configuración en MongoDB.
async function getAllFeedItemGetters (){
    let dbRss = await mongoWrapper.getAllRss()
    let dbRssDoc = []
    for (let rss in dbRss){
        dbRssDoc.push(dbRss[rss]._doc)
    }
    return dbRssDoc.map(config => 
        new feedItems(
            config.source,
            config.url,
            config.category,
            config.isActive,
            config.maxElementsCache
        )
    );
}

// ==============================
// 5. Funciones auxiliares: Gestión de feeds y categorías
// ==============================

//Devuelve toda la configuración de feeds RSS desde MongoDB
exports.getAllRss = async function (){
    return await mongoWrapper.getAllRss()
}

// Guarda o actualiza la configuración de un feed RSS
exports.storeRss = async function (rss){
    return await mongoWrapper.setRss(rss)
}
// Elimina una fuente RSS por su identificador
exports.deleteRss = function (source){
     mongoWrapper.deleteRssBySource(source)
}
//Devuelve todas las categorías almacenadas
exports.getAllCategories = async function (){
    return await mongoWrapper.getAllCategories()
}

// Almacena una nueva categoría
exports.storeCategory = async function (rss){
    return await mongoWrapper.setCategory(rss)
}


// Añadir categoría 
exports.setCategory = async function (category) {
    return await mongoWrapper.setCategory(category);
};

// Eliminar categoría
exports.deleteCategory = async function (type) {
    return await mongoWrapper.deleteCategory(type);
};
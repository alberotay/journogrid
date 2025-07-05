const mongoose = require('mongoose');
// ==============================
// rssShcema.js
// Esquema de configuración de fuentes RSS en MongoDB usando Mongoose
// Cada documento representa un feed configurado en el sistema
// ==============================

const rssSchema = new mongoose.Schema({
    source: { type: String }, // Fuente del feed
    url: { type: String }, // Fuente del feed
    category: { type: String }, // Fuente del feed
    isActive: { type: Boolean }, //
    maxElementsCache: {type: Number}// Numero Maximo de resultados cachedados
});
// Crea el modelo "RssConfiguration" basado en el esquema anterior
const Rss = mongoose.model('RssConfiguration', rssSchema);
// Exporta el modelo para usarlo en los controladores y wrappers de la app
module.exports = Rss;
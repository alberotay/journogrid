// ==============================
//  feedParser.js
//  Descarga y parseo de feeds RSS usando rss-url-parser
//  - Proporciona una función asíncrona para obtener las noticias crudas desde la URL de un feed RSS
// ==============================
const parserMedia = require('rss-url-parser') // Importa la librería que descarga y parsea el feed RSS


/**
 * Descarga y parsea un feed RSS desde una URL dada.
 * @param {String} url - URL del feed RSS a procesar
 * @returns {Promise<Array>} Array de noticias crudas (tal cual las devuelve rss-url-parser)
 */

const parseMedia = async url => {
    try {
        // Llama a la librería externa para descargar y parsear el RSS
        const feed = await  parserMedia(url)
        console.log("got " + feed.length + " news from " + url)
        return (feed) // Devuelve el array de noticias crudas
    } catch (e) {
        // Si hay un error (URL caída, timeout, mal formado, etc.), lo loguea y devuelve array vacío
        console.log("!!!!!!Failed on " + url)
        return []
    }
};


exports.parseMedia = parseMedia;
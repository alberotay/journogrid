'use strict';
// feed.js
// Clase feedItems: Gestión individual de cada fuente RSS

let utils = require("../utils");            // Utilidades de normalización y extracción de datos
let  myParser =require("./feedParser");     // Módulo para descargar y parsear el feed RSS
let mongoWrapper = require("../db/mongoWrapper")


/**
 * Clase feedItems
 * Representa una fuente RSS individual, con sus métodos de parseo y almacenamiento.
 */
class feedItems {
    /**
     * Constructor de la clase
     * @param {String} elementSource - Identificador/fuente del feed
     * @param {String} url - URL del RSS a procesar
     * @param {String} category - Categoría asignada al feed
     * @param {Boolean} isActive - Si la fuente está activa o no
     * @param {Number} maxElementsCache - Máximo de noticias a cachear por este feed
     */
 
    constructor(elementSource,url,category,isActive,maxElementsCache) {
        this.url = url;
        this.elementSource = elementSource;
        this.frontendImage = "/logos/"+this.elementSource+".svg";   // Imagen asociada para el frontend
        this.elements = [];     // Array temporal para almacenar las noticias descargadas
        this.category = category;
        this.isActive = isActive;
        this.maxElementsCache = maxElementsCache
    }


    async parseItems(){
        this.elements = await myParser.parseMedia(this.url) // Paso 1: Descargar y parsear RSS
        let feedsNormalized = utils.feedNormalizerMedia(
            this.elements,
            this.elementSource,
            this.frontendImage,
            this.category
        );// Paso 2: Normalizar usando utils.js
        this.storeNews(feedsNormalized); // Paso 3: Guardar en MongoDB

    }
     /**
     * Devuelve los artículos de la base de datos filtrados por esta fuente
     * @param {Object} filter - Filtro opcional de búsqueda
     * @returns {Object} Objeto con los datos del feed y sus noticias
     */
    async getItems(filter) {
        if (!filter){
            filter = {source : this.elementSource}
        }else{
            filter.source = this.elementSource
        }
        return {
            source: this.elementSource,
            category: this.category,
            allFeeds: await this.getNews(filter),
            frontEndImage: this.frontendImage,
            hasNewElements: false,      // Campo para marcar si hay novedades (se puede usar en el frontend)
            maxElementsCache:this.maxElementsCache
        };
    }
//Guarda un array de noticias en MongoDB
     storeNews(newsArray){
            mongoWrapper.storeNewsByArray(newsArray)
    }

    async getNews(filter){
        return await mongoWrapper.getNewsByFilter(filter)
    }
}
// Exporta la clase para su uso en otros módulos
module.exports = feedItems;
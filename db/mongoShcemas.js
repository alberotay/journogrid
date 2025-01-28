const mongoose = require('mongoose');
const { defaults } = require('request');

// Esquema para las noticias
const newsSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Identificador de la noticia
    title: { type: String, required: true }, // Título de la noticia
    link: { type: String, required: true, unique: true }, // Enlace único
    pubDate: { type: Date }, // Fecha de publicación
    source: { type: String }, // Fuente del feed
    category: { type: String }, // Categoría de la noticia
    thumbnailUrl: { type: String }, // Imagen asociada a la noticia
    description: { type: String }, // Descripción de la noticia
});

// Crear el modelo basado en el esquema

const News = mongoose.model('News', newsSchema);

module.exports = News;
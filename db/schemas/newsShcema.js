const mongoose = require('mongoose');
// ==============================
// newsShcema.js
// Define el esquema de una noticia para MongoDB usando Mongoose
// Establece qué campos tiene cada documento de la colección "News"
// ==============================

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
    horaEntradaBD: { type: Date, default: Date.now }, // Hora de entrada a la base de datos
    videoUrl: { type: String }, // URL del video asociado
});

// Crea el modelo "News" basado en el esquema anterior
const News = mongoose.model('News', newsSchema);
// Exporta el modelo para poder usarlo en otras partes del proyecto
module.exports = News;
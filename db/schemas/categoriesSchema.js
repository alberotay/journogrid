const mongoose = require('mongoose');

// ==============================
// categoriesSchema.js
// Esquema simple para las categorías de noticias
// Cada documento representa una categoría posible en el sistema
// ==============================

const categorySchema = new mongoose.Schema({
    type: { type: String }
});
// Crea el modelo "Category" basado en el esquema anterior
const category = mongoose.model('Category', categorySchema);
// Exporta el modelo para usarlo en los controladores y en mongoWrapper
module.exports = category;
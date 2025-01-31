const mongoose = require('mongoose');

// Conectar a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/newsdb', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conexión a MongoDB exitosa');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1); // Finaliza la aplicación si falla la conexión
    }
};

module.exports = connectDB;
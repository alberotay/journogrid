require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;
const mongoose = require('mongoose');
const Usuario = require('./db/schemas/userSchema'); // Importa tu modelo de usuario

//const uri = MONGO_URI;

async function insertarUsuario() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Conectado a MongoDB');

        const password = 'unir'; // Contraseña en texto plano (¡sin hashear!)

        const nuevoUsuario = new Usuario({
            username: 'unir',
            password: password // Guarda la contraseña en texto plano (se hasheará en el schema)
        });

        await nuevoUsuario.save();
        console.log('Usuario creado');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

insertarUsuario();
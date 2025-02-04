const mongoose = require('mongoose');
const Usuario = require('./db/schemas/userSchema'); // Importa tu modelo de usuario

const uri = "mongodb://127.0.0.1:27017/newsdb";

async function insertarUsuario() {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Conectado a MongoDB');

        const password = 'test'; // Contraseña en texto plano (¡sin hashear!)

        const nuevoUsuario = new Usuario({
            username: 'test',
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
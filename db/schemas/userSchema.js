const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Importa bcrypt aquí

// ==============================
// userSchema.js
// Esquema de usuario para autenticación segura con Mongoose y bcrypt
// ==============================

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
// Middleware que se ejecuta antes de guardar un usuario nuevo o actualizar la contraseña
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) { // Hashea solo si la contraseña ha sido modificada
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
// Método del modelo para comprobar si una contraseña es correcta
userSchema.methods.validPassword = async function(password) {
    try {
        const result = await bcrypt.compare(password, this.password);
        console.log("Comparacion contraseña: "+result )
        return result;
    } catch (error) {
        console.error("Error en la comparación bcrypt:", error);
        return false;
    }
};
// Crea y exporta el modelo "Users" para usar en autenticación y gestión de usuarios
module.exports = mongoose.model('Users', userSchema);
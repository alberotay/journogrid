const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Importa bcrypt aquí

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) { // Hashea solo si la contraseña ha sido modificada
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

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

module.exports = mongoose.model('Users', userSchema);
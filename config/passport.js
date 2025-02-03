const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Users = require('../db/schemas/userSchema'); // Asegúrate de que la ruta sea correcta

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            console.log("LocalStrategy verification reached");
            console.log("Username:", username);
            console.log("Password:", password); // Log the password (for debugging only)

            const user = await Users.findOne({ username: username });

            if (!user) {
                console.log("User not found");
                return done(null, false, { message: 'Usuario incorrecto.' });
            }

            const isValidPassword = await user.validPassword(password);

            if (!isValidPassword) {
                console.log("Incorrect password");
                return done(null, false, { message: 'Contraseña incorrecta.' });
            }

            console.log("Authentication successful");
            return done(null, user);
        } catch (err) {
            console.error("Error in authentication strategy:", err);
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Users.findById(id); // Usar Users (con 's')
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
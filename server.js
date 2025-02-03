const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const feedsDecorator = require('./feeds/feedsDecorator');
const passport = require('./config/passport');
const session = require('express-session');
const flash = require('connect-flash');



app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs'); // Configura EJS como motor de plantillas

let uniqueIPs = new Set();

// Configuración de la sesión (¡ANTES de Passport!)
app.use(session({
    secret: 'tu_clave_secreta', // ¡CAMBIA ESTO POR UNA CLAVE FUERTE!
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // 'secure: true' para HTTPS en producción
}));

// Inicialización de Passport (¡UNA SOLA VEZ!)
app.use(flash()); // Usa connect-flas
app.use(passport.initialize());
app.use(passport.session());






// Rutas de autenticación
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    }),
    (req, res) => {
        console.log("Callback ejecutado");
        console.log("req.user:", req.user);
        console.log("Mensajes flash:", req.flash('error'));
        res.status(401).send("Authentication failed"); // Send a simple response with 401 status
    }
);


app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { user: req.user }); // Asegúrate de tener una vista 'profile'
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.get('/login', function (req, res) {
    res.render('login', { errorMessage: req.flash('error') }); // Renderiza la vista 'login.ejs' y pasa el mensaje de error
});

// Endpoint principal
app.get('/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Endpoint para devolver las noticias desde Redis
app.get('/api/rss', async (req, res) => {
    console.log('Petición RSS desde ' + req.ip);
    uniqueIPs.add(req.ip);
    console.log(`Total de direcciones IP únicas conectadas: ${uniqueIPs.size}`);
    res.send(await feedsDecorator.getNewsFromCache());
});

app.get('/admin', isLoggedIn, async (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'admin.html'));
});

app.get('/advancedSearch', async (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'advancedSearch.html'));
});

app.get('/api/search', async (req, res) => {
    const { startDate, endDate, keyword } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Faltan fechas de inicio y fin." });
    }

    try {
        console.log(`📅 Buscando noticias entre ${startDate} y ${endDate}`);

        const query = {
            pubDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
        if (keyword) {
            query.title = { $regex: keyword, $options: "i" };
        }

        const news = await feedsDecorator.getDataNews(query);
        console.log(`✅ ${news.length} noticias encontradas`);
        res.json(news);
    } catch (error) {
        console.error('❌ Error en /api/search:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/getAllRss', async (req, res) => {
    res.send(await feedsDecorator.getAllRss());
});

app.post('/api/setRss', isLoggedIn,async (req, res) => {
    feedsDecorator.storeRss(req.body);
    res.send("ok");
});

app.post('/api/deleteRss',isLoggedIn, async (req, res) => {
    feedsDecorator.deleteRss(req.body.source);
    res.send("ok");
});

app.get('/api/getAllCategories', async (req, res) => {
    res.send(await feedsDecorator.getAllCategories());
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto 3000');
});
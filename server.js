require('dotenv').config(); // Cargar variables de entorno desde .env

const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const feedsDecorator = require('./feeds/feedsDecorator');
const passport = require('./config/passport');
const session = require('express-session');
const flash = require('connect-flash');
const utils = require('./utils');
///////////////////////////////////////MPEG
const ffmpeg = require('fluent-ffmpeg');
const ffmpegBin = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegBin);
/////////////////////////////////////

const PORT = process.env.PORT || 3000; // Usar variables de entorno
const voiceConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'voice_config.json'), 'utf-8')
);

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs'); // Configura EJS como motor de plantillas

let uniqueIPs = new Set();
let audioBuffer = null;

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
    let allNewsFromCache =  await feedsDecorator.getNewsFromCache()
    res.send(utils.sortForClient(allNewsFromCache,req.query.lastView));
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

// Añadir una categoría
app.post('/api/setCategory', async (req, res) => {
    try {
        await feedsDecorator.setCategory(req.body);
        res.send("ok");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Eliminar una categoría
app.post('/api/deleteCategory', async (req, res) => {
    try {
        await feedsDecorator.deleteCategory(req.body.type);
        res.send("ok");
    } catch (error) {
        res.status(500).send(error.message);
    }
});


//////////////IA/////////////////////////
let summary = ""; // Variable para almacenar el resumen

//app.get('/api/generateSummary', async (req, res) => {
    async function generateSummary() {
    try {
       // console.log(`📅 Buscando las 20 noticias más recientes`);

        // Llamada a getDataNews, que devuelve un array
        const news = await feedsDecorator.getDataNews({});

        // Aquí hacemos sort y slice para limitar los 5 más recientes
        const sortedNews = news.sort((a, b) => b.pubDate - a.pubDate).slice(0, 20);

        //console.log(`✅ ${sortedNews.length} noticias encontradas`);
        const fechaActual = new Date().toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'short'
        }); // Formato de fecha y hora en español

       // Crear el prompt para la IA con la orden incluida
       const prompt = `Comienza siempre el texto indicando la fecha y la hora actual de la crónica: "${fechaActual}" con un tono periodístico. Después, Escribe una crónica simpática de 120 palabras con las siguientes noticias y personalizalo:\n` +
       sortedNews.map((item, index) => {
           return `Noticia ${index + 1}: Título: ${item.title}}`;
          // return `Noticia ${index + 1}: Título: ${item.title}, Descripción: ${item.description || 'No disponible'}`;
       }).join('\n');

        //console.log(`Prompt generado: \n${prompt}`);

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistral:7b',
                prompt: prompt,
                stream: false
            })
        });
        if (!response.ok) {
            throw new Error('Error al obtener respuesta de la IA');
        }
        const data = await response.json();
        if (data.response) {
            summary = data.response; // Almacenar la respuesta de la IA en la variable global
            console.log(`✅ Resumen generado y almacenado`);
            //console.log(`✅ Resumen generado y almacenado: \n${summary}`);
            // Una vez generado el resumen, generamos la voz automáticamente
            await generateVoice(summary);
        } else {
            throw new Error('La respuesta de la IA está vacía');
        }

    } catch (error) {
        console.error('❌ Error al generar resumen:', error);
        summary = ""; // Si ocurre un error, dejamos la variable vacía
    }
}
// Función para generar la voz automáticamente cuando el resumen se genera
async function generateVoice(summary) {
    const payload = {
        ...voiceConfig, // Inserta speaker_embedding y gpt_cond_latent desde el archivo
        text: summary,
        language: "es",
        stream_chunk_size: 0,
        add_wav_header: true
    };

    try {
        const response = await fetch('http://localhost:8000/tts_stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/octet-stream'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('❌ Error al generar la voz');
        }

        audioBuffer = await response.arrayBuffer();
        console.log("✅ Voz generada correctamente");
        ///////////////////////MPEG
        const tempDir = path.join(__dirname, 'temp');
fs.mkdirSync(tempDir, { recursive: true });
const vozPath = path.join(tempDir, 'voz.wav');
fs.writeFileSync(vozPath, Buffer.from(audioBuffer));

// Mezclar con música de fondo usando ffmpeg
const fondoPath = path.join(__dirname, 'assets', 'fondo.wav');
const salidaPath = path.join(tempDir, 'voz_con_fondo.wav');
const delayMs = 2500; // 2 segundos de retardo
await new Promise((resolve, reject) => {
    ffmpeg()
        .input(vozPath)
        .input(fondoPath)
        .complexFilter([
            `[0:a]adelay=${delayMs}|${delayMs},volume=1[a1]`, // Aplica retardo a la voz
            '[1:a]volume=0.1[a2]',
            '[a1][a2]amix=inputs=2:duration=first:dropout_transition=2'
        ])
        .output(salidaPath)
        .audioCodec('pcm_s16le')
        .on('end', resolve)
        .on('error', reject)
        .run();
});
// Carga el resultado en memoria
audioBuffer = fs.readFileSync(salidaPath);
console.log('✅ Voz con fondo musical lista');
        /////////////////////////////

    } catch (error) {
        console.error('❌ Error al generar la voz:', error);
    }
}

// Ejecutar la función cada 5 minutos (300,000 ms)
setInterval(generateSummary, 4000000);

// Llamada inicial para generar el resumen en el arranque del servidor
generateSummary();

// En esta ruta GET, podemos devolver el resumen generado
app.get('/api/getSummary', (req, res) => {
    res.send({ summary: summary });
});
       

///////////////////////////////////

// Iniciar el servidor
app.listen(PORT, () => {
    console.log('Servidor iniciado en el puerto', PORT);
});

// Ruta para obtener la voz generada en formato de audio

app.get('/api/getVoice', (req, res) => {
    
    if (!audioBuffer) {
        return res.status(400).send('Voz no disponible aún');
    }
    res.set('Content-Type', 'audio/mp3');
    res.send(Buffer.from(audioBuffer)); // Enviar el archivo de audio generado
});
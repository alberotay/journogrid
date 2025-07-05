// ==================
//  Cargar dependencias y config global
// ==================

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
// ========= FFMPEG para mezclar audio 5-7-25 =========
const ffmpeg = require('fluent-ffmpeg');
const ffmpegBin = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegBin);

// ==================
// Config global
// ==================

const PORT = process.env.PORT || 3000; // Usar variables de entorno
const voiceConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'assets','voice_config.json'), 'utf-8')
);
// ==================
//  Middlewares básicos
// ==================
app.use(express.static('public'));  // Archivos estáticos
app.use(cors());                    // Habilitar CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs'); // Configura EJS como motor de plantillas para administrator

let uniqueIPs = new Set(); // IPs únicas conectadas(control de acceso no necesario)
let audioBuffer = null; // Buffer para el audio generado por IA

// ==================
//  Configuración de sesión y Passport
// ==================
app.use(session({
    secret: 'tu_clave_secreta', // Cambia esto en producción
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // 'secure: true' para HTTPS en producción
}));

// Inicialización de Passport (¡UNA SOLA VEZ!)
app.use(flash()); // Mensajes flash para login/error
app.use(passport.initialize()); // Inicializa Passport
app.use(passport.session());    // Login persistente

// ==================
//  Rutas de autenticación
// ==================
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

// ==================
//  Endpoints principales (Web y API)
// ==================
app.get('/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.get('/admin', isLoggedIn, async (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'admin.html'));
});

app.get('/advancedSearch', async (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'advancedSearch.html'));
});

// ==================
//  API: Gestión y consulta de noticias y fuentes
// ==================
app.get('/api/rss', async (req, res) => {
    console.log('Petición RSS desde ' + req.ip);
    uniqueIPs.add(req.ip);
    console.log(`Total de direcciones IP únicas conectadas: ${uniqueIPs.size}`);
    let allNewsFromCache =  await feedsDecorator.getNewsFromCache()
    res.send(utils.sortForClient(allNewsFromCache,req.query.lastView));
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

// ==================
//  IA: Generación de resumen y voz
// ==================
let summary = ""; // Variable para almacenar el resumen

//app.get('/api/generateSummary', async (req, res) => {
    //Propuesta para que fuese el cliente quien llamase a la generacón del resumen rechazada
    async function generateSummary() {  // Función asincrona para generar el resumen debido a latencia de  funciones internas
    try {
       // console.log(`📅 Buscando las 20 noticias más recientes`);
        // 1. Buscar las 20 noticias más recientes
        // Llamada a getDataNews, que devuelve un array
        const news = await feedsDecorator.getDataNews({});
        // Aquí hacemos sort y slice para limitar los 20 más recientes
        const sortedNews = news.sort((a, b) => b.pubDate - a.pubDate).slice(0, 20);
        //console.log(`✅ ${sortedNews.length} noticias encontradas`);
        // 2. Preparar el prompt para la IA
        const fechaActual = new Date().toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'short'
        }); // Formato de fecha y hora en español
       // Crear el prompt para la IA con la orden incluida
        
       //const prompt = `Redacta una crónica periodística breve de exactamente 120 palabras. Comienza siempre con la fecha y hora actual: "${fechaActual}". Adopta el rol de un presentador de informativos ofreciendo un avance serio y claro, con tono neutral y sin introducir opiniones personales o juicios de valor (evita cualquier tipo de sesgo). Piensa paso a paso como un reportero: analiza las noticias, prioriza aquellas con mayor impacto social (por ejemplo: política, economía, sanidad, conflictos), agrúpalas lógicamente y redacta un avance informativo con continuidad narrativa. Limítate únicamente a la información contenida en los siguientes titulares, sin añadir datos no presentes en ellos ni especulaciones.**elementos criticos:** nunca me enumeres las noticias, la respuesta en español siempre,si el contenido de la noticia no tiene relevancia social omitela, tiene que ser una locucion profesional para sintetizar voz. Aquí están las noticias: ` +
       const prompt = `Comienza siempre con la fecha y hora actual: "${fechaActual}" con un tono periodístico. Después, Escribe una crónica simpática de 120 palabras con las siguientes noticias y personalizalo:` +
         
       
       sortedNews.map((item, index) => {
           return `Noticia ${index + 1}: Título: ${item.title}}`;
          // return `Noticia ${index + 1}: Título: ${item.title}, Descripción: ${item.description || 'No disponible'}`;
         }).join('\n');
        //console.log(`Prompt generado: \n${prompt}`);

        // 3. Llamar a la IA en OLLAMA para generar el resumen
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
// Generar la voz para el resumen (TTS) y mezclarla con música de fondo
async function generateVoice(summary) {
    const payload = {
        ...voiceConfig, // Inserta speaker_embedding y gpt_cond_latent desde el archivo(audio tokenizado)
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
        console.log("✅Voz generada correctamente");
        // Guardar la voz y mezclar con música de fondo
        const tempDir = path.join(__dirname, 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const vozPath = path.join(tempDir, 'voz.wav');
        fs.writeFileSync(vozPath, Buffer.from(audioBuffer));


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
    } catch (error) {
        console.error('❌ Error al generar la voz:', error);
    }
}

// Cada 60 minutos aprox. (ajusta si quieres menos)
setInterval(generateSummary, 4000000);

// Llamada inicial para generar el resumen en el arranque del servidor
generateSummary();

// Endpoint para obtener el resumen actual
app.get('/api/getSummary', (req, res) => {
    res.send({ summary: summary });
});

// Endpoint para obtener el audio generado
app.get('/api/getVoice', (req, res) => {
    
    if (!audioBuffer) {
        return res.status(400).send('Voz no disponible aún');
    }
    res.set('Content-Type', 'audio/mp3');
    res.send(Buffer.from(audioBuffer)); // Enviar el archivo de audio generado
});       

// ==================
//  Inicialización del servidor
// ==================
app.listen(PORT, () => {
    console.log('Servidor iniciado en el puerto', PORT);
});


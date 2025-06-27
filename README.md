
<p align="center">
  <img src="https://aspas.myqnapcloud.com/logos/zorritoIA.svg" height="110" alt="JournoGrid logo">
</p>

<h1 align="center">📰 JournoGrid</h1>
<p align="center">
  <b>El agregador de noticias inteligente, personalizable y rápido.<br>Organiza, filtra y consulta cientos de medios en tiempo real.</b>
</p>
<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18.x-brightgreen?logo=node.js"></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-%20v6.0-success?logo=mongodb"></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-7.x-critical?logo=redis"></a>
  
</p>

---

## 🌟 ¿Qué es JournoGrid?

**JournoGrid** es una plataforma que te permite visualizar y organizar feeds de noticias de múltiples fuentes de forma centralizada, eficiente y visualmente atractiva. Pensada para profesionales, redacciones y usuarios avanzados, incorpora IA para resumen automático y sintetización por voz.

---

## 🚀 Características principales

- 📥 **Agregador de Feeds RSS:** Cientos de fuentes configurables, agrupadas por categorías.
- ⚡ **Actualización en tiempo real:** Interfaz reactiva, sin recargar página.
- 💾 **Backend Node.js + MongoDB + Redis:** Rápido, escalable y eficiente.
- 🧠 **Integración IA:** Resúmenes automáticos, generación de voz y más.
- 📱 **Modo escritorio & móvil:** UI adaptable según dispositivo.
- 🗂️ **Filtrado y orden personalizado:** Elige categorías y el orden de columnas.
- 🗂️ **Busquedas avanzadas:** Palabra y  fechas .
- 🎨 **Visual minimalista:** Tarjetas, flashes de novedad, drag&drop.

---

## 🖼️ Vista rápida

### Escritorio
<img src="https://aspas.myqnapcloud.com/logos/escritorio.jpg" width="700" alt="JournoGrid Desktop" />

### Móvil
<img src="https://aspas.myqnapcloud.com/logos/mobile.png" width="300" alt="JournoGrid Mobile" />


---

## ⚡ Últimas actualizaciones

-  **Actualización de modulo  TTS a XTTS COQUI v2** 20/06/2025.
-  **Insercion de Timestamp  en las noticias** 27/06/2025.
-  **Implementación de video o iframe en las noticias** 27/06/2025.

-----



## Procedimiento

- Arrancamos con un npm install.
- creamos el .env => PORT ,MONGO_URI, REDIS_URI
- Recomendación => redis y mongodb corren en docker  deberemos crear el usuario y password  para la base de datos
use newsdb
db.createUser({
  user: "",
  pwd: "",
  roles: [{ role: "readWrite", db: "newsdb" }]
<<<<<<< HEAD
})
- Generador de texto IA => Ollama serve .
- Sintetizador de voz=> docker run --gpus=all -e COQUI_TOS_AGREED=1 --name coqui-xtts -d -p 8000:80 ghcr.io/coqui-ai/xtts-streaming-server:latest-cuda121 .
||||||| 7b450d7
})
=======
})
- Generador de texto IA => Ollama serve .
- Sintetizador de voz=> docker run --gpus=all -e COQUI_TOS_AGREED=1 --name coqui-xtts -d -p 8000:80 ghcr.io/coqui-ai/xtts-streaming-server:latest-cuda121 .
>>>>>>> 115c3061e68d3b13db1602efe8f8871c6afe39e6

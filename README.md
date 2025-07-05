
<p align="center">
  <img src="https://github.com/alberotay/journogrid/blob/main/public/logos/zorritoIA.svg" width="80" alt="JournoGrid logo">
</p>

<h1 align="center">📰 JournoGrid</h1>
<p align="center">
  <b>Tu agregador de noticias inteligente, personalizable y rápido.<br>Organiza, filtra y consulta cientos de medios en tiempo real.</b>
</p>
<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18.x-brightgreen?logo=node.js"></a>
  <a href="https://www.npmjs.com/">
  <img src="https://img.shields.io/badge/npm-%23CB3837.svg?logo=npm&logoColor=white">
</a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-%20v6.0-success?logo=mongodb"></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-7.x-critical?logo=redis"></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-4.x-grey?logo=express"></a>
<a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-%230db7ed.svg?logo=docker&logoColor=white"></a>
<a href="https://ollama.com/"><img src="https://img.shields.io/badge/Ollama-LLM-5f5fff?logo=OpenAI"></a>
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
<img src="https://github.com/alberotay/journogrid/blob/main/public/logos/escritorio.jpg" width="700" alt="JournoGrid Desktop" />

### Móvil
<img src="https://github.com/alberotay/journogrid/blob/main/public/logos/mobile.png" width="300" alt="JournoGrid Mobile" />


---

## ⚡ Últimas actualizaciones

-  **Actualización de modulo  TTS a XTTS COQUI v2** 20/06/2025.
-  **Insercion de Timestamp  en las noticias** 27/06/2025.
-  **Implementación de video o iframe en las noticias** 27/06/2025.

-----

**Requisitos previos:**  
• [Node.js](https://nodejs.org/) (LTS recomendado)  
• [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)  
• [Ollama](https://ollama.com/) para generación de texto por IA  
• GPU compatible (opcional, pero recomendable para la generación de texto y síntesis de voz con Coqui xTTS-v2)

**Instalación rápida:**  

**1️⃣ Clona el repositorio y prepara dependencias:**  
```
git clone <url>
cd journogrid
npm install
```
**2️⃣ Configura las variables de entorno:**

- Crea el archivo .env en la raíz del proyecto (ajusta valores si lo necesitas):
```
PORT=3000
MONGO_URI=mongodb://user:password@localhost:27017/newsdb
REDIS_URI=redis://localhost:6379
```
**3️⃣ Despliega los servicios con Docker:**

- MongoDB con persistencia de datos:
```
docker run -d --name mongo-server -p 27017:27017 -v ~/mongo-data:/data/db mongo
```
- Entra al contenedor para crear el usuario y la base de datos:
```
docker exec -it mongo-server mongosh
use newsdb
db.createUser({ user: "user", pwd: "password", roles: [{ role: "readWrite", db: "newsdb" }] })
exit
```
- REDIS
```
docker run -d --name redis-server -p 6379:6379 redis
```

**4️⃣ Crea el usuario administrador:**

- Edita el archivo userScript.js con los datos del usuario administrador y ejecútalo:

```
node userScript.js
```

**5️⃣ IA y síntesis de voz:**

- Generador de texto (Ollama):
```
ollama serve
```
- Sintetizador de voz (Coqui xTTS-v2) con GPU:
```
docker run --gpus=all -e COQUI_TOS_AGREED=1 --name coqui-xtts -d -p 8000:80 ghcr.io/coqui-ai/xtts-streaming-server:latest-cuda121
```
**6️⃣ Arranca Journogrid:**
```
node server.js
```
**Notas y recomendaciones:**

- Los puertos 27017 (MongoDB), 6379 (Redis), 8000 (Coqui TTS) y 3000 (backend) deben estar libres

- Personaliza los usuarios y contraseñas en tu .env y en la creación del usuario MongoDB si lo deseas

- Si quieres persistencia avanzada para los datos de MongoDB o Redis, puedes cambiar la ruta del volumen por la que prefieras

- El usuario administrador es imprescindible para gestionar fuentes, categorías y toda la configuración desde el panel web

**Preguntas frecuentes:**

- ¿Puedo usar la plataforma sin GPU? Sí, pero la síntesis de voz será mucho más lenta

- ¿Cómo respaldo mis datos? Usa volúmenes persistentes de Docker (-v) para MongoDB y Redis

- ¿Qué hago si algún puerto está ocupado? Cambia el puerto correspondiente en tu .env y en el comando de Docker
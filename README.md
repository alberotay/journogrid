
<p align="center">
  <img src="https://aspas.myqnapcloud.com/logos/zorritoIA.svg" height="110" alt="JournoGrid logo">
</p>

<h1 align="center">📰 JournoGrid</h1>
<p align="center">
  <b>Tu agregador de noticias inteligente, personalizable y rápido.<br>Organiza, filtra y consulta cientos de medios en tiempo real.</b>
</p>
<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18.x-brightgreen?logo=node.js"></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-%20v6.0-success?logo=mongodb"></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-7.x-critical?logo=redis"></a>
  <a href="https://github.com/youruser/JournoGrid/blob/main/LICENSE"><img src="https://img.shields.io/github/license/youruser/JournoGrid?color=blue"></a>
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
- 🎨 **Visual minimalista:** Tarjetas, flashes de novedad, drag&drop.

---

## 🖼️ Vista rápida

### Escritorio
<img src="https://user-images.githubusercontent.com/1670112/177870222-1844477c-cb04-4c72-a21e-fb82e34b0e82.png" width="700" alt="JournoGrid Desktop" />

### Móvil
<img src="https://user-images.githubusercontent.com/1670112/177870242-55a6a6ed-b8ba-4f16-8de3-04d77991dc87.png" width="300" alt="JournoGrid Mobile" />












# Procedimiento
#Power by MOngo & Redis
Arrancamos con un npm install, creamos el .env , actualmente  redis y mongodb corren en docker  deberemos crear el usuario y password  para la base de datos
use newsdb
db.createUser({
  user: "",
  pwd: "",
  roles: [{ role: "readWrite", db: "newsdb" }]
})

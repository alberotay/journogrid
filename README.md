
# Normalización y transformación del proyecto 22/01/2025
#Power by MOngo & Redis
Arrancamos con un npm install, creamos el .env , actualmente  redis y mongodb corren en docker  deberemos crear el usuario y password  para la base de datos
use newsdb
db.createUser({
  user: "",
  pwd: "",
  roles: [{ role: "readWrite", db: "newsdb" }]
})
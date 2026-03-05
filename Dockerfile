# Usamos una imagen de Node estable
FROM node:20-alpine

# Creamos la carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos los archivos de configuración de paquetes
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto 3000
EXPOSE 3000

# Comando para arrancar en modo desarrollo con TypeScript
CMD ["npm", "run", "dev"]
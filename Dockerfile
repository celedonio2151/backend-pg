# Usar una imagen de Node.js como base
FROM node:22-alpine3.20

# Establecer el directorio de trabajo en el contenedor
WORKDIR /backendMosojLlajta

# Copiar package.json y package-lock.json
COPY package*.json .

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Construir la aplicación NestJS
RUN npm run build

# Instalar herramientas necesarias para hot-reload (si no están ya)
RUN npm install -g @nestjs/cli

# Exponer el puerto en el que corre la aplicación (3000 por defecto)
# EXPOSE 4000

# Comando para correr la aplicación
# CMD ["npm", "run", "start"]
CMD ["npm", "run", "start:dev"]

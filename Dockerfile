FROM node:23.11.0-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias con desarrollo para el build
RUN npm ci

# Copiar el código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Limpiar dependencias de desarrollo
RUN npm prune --production

# Crear usuario no root
RUN groupadd -g 1001 -r nextjs && useradd -r -g nextjs -u 1001 nextjs
RUN chown -R nextjs:nextjs /app

USER nextjs

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]

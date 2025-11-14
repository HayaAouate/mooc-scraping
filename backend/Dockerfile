# backend/Dockerfile

# Étape 1: Image de base Node.js
FROM node:20-alpine

# Crée le répertoire de travail dans le conteneur
WORKDIR /app/backend

# Copie package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installe les dépendances
# --no-cache: optimise la taille
RUN npm install --omit=dev

# Copie le reste du code source (incluant .env, hypercacher.js, server.js, etc.)
COPY . .

# Démarre l'application
CMD [ "node", "server.js" ]
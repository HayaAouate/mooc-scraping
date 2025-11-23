# Backend — `backend/`

Ce dossier contient l'API Express et les scrapers (Axios+Cheerio et Puppeteer). Le backend expose des routes de scraping et peut persister les résultats en base (MongoDB).

Principaux fichiers
- `index.js` : point d'entrée Express (routes : `/scrape`, `/api/leclerc`, etc.).
- `leclerc.js` : scraper pour Leclerc (fonction `getLeclercProducts()` — safe à importer)
- `Hypercacher.js` : scraper Hypercacher (fonction `getHypercacherProducts()` et `runHypercacher()`)
- `nodemon.json` : configuration nodemon (legacyWatch pour volumes Docker/Windows)
- `test-mongo.js` : script de test pour insérer un doc en Mongo via Mongoose

Variables d'environnement
- `MONGO_URL` : URI Mongo (par défaut `mongodb://mongo_db:27017/mooc_scraping` en Docker Compose)

Exécuter en local (hors Docker)
```powershell
cd backend
npm install
# dev (nodemon)
npm run dev
```

Exécuter via Docker Compose
```powershell
cd C:\Users\Aouat\Desktop\mooc-scraping
docker compose up -d --build
```

Endpoints utiles
- `GET /scrape` : exemple de scraping (Auchan dans le projet)
- `GET /api/leclerc` : exécute `getLeclercProducts()` côté serveur et renvoie les noms produits

Notes opérationnelles
- Le service backend est configuré pour démarrer `runHypercacher()` en tâche de fond après `app.listen` (lancer une extraction unique au démarrage). Vous pouvez modifier ce comportement si vous préférez déclencher manuellement.
- Si vous utilisez Puppeteer dans `Hypercacher.js`, l'image Docker du backend a été ajustée (`node:22-bullseye`) et installe des paquets OS nécessaires à Chromium.
- Pour le développement local, `nodemon.json` contient `legacyWatch: true` afin de forcer le polling dans les environnements qui montent des volumes (Docker Desktop / Windows).

Tester la connexion à Mongo
```powershell
# depuis l'hôte (si mongosh installé)
mongosh mongodb://localhost:27017
# ou exécuter le script de test (utilise MONGO_URL ou localhost par défaut)
node test-mongo.js
```

Persistance
- Le backend peut être adapté pour enregistrer les produits dans Mongo via Mongoose. Si vous voulez que j'ajoute un modèle `Product` et que j'enregistre automatiquement les résultats de `runHypercacher()` et `getLeclercProducts()`, dites‑le et je l'implémente.
Migration: avec la cmd:
docker compose exec backend node migrate-add-fields.js
docker compose exec backend node import-hypercacher.js

Comment utiliser maintenant

Démarrer l'application normalement : le backend n'exécutera aucun scraping au démarrage (aucune requête DOM/Puppeteer lancée automatiquement).
Lancer le scraper à la demande (depuis l'hôte ou dans le conteneur backend) :
Dans le conteneur backend :
docker compose exec backend node run-hypercacher.js

migration: node migrations/20251116-import-hypercacher-json.js
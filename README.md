# Mooc-scraping

Petit projet de scraping (backend Node/Express) et frontend (Vite + React). Le projet contient :
- `backend/` : serveur Express qui exécute des scrapers (Leclerc, Hypercacher) et expose des endpoints API.
- `prix-malin/` : frontend React (Vite) qui consomme l'API backend.
- `docker-compose.yml` : orchestre `mongo_db`, `backend`, `frontend` et une UI `mongo-express`.

Ports exposés par défaut (dévelop.) :
- Backend : `http://localhost:3000`
- Frontend : `http://localhost:5173`
- MongoDB : `mongodb://localhost:27017`
- Mongo Express (UI) : `http://localhost:8081` 

Prérequis
- Docker Desktop (ou Docker + docker-compose)
- Node.js & npm (si vous voulez exécuter backend/frontend hors conteneur)

Démarrage rapide (tout en Docker)
```powershell
cd C:\Users\Aouat\Desktop\mooc-scraping
docker compose up -d --build
docker compose ps
```

Accéder à l'UI Mongo : `http://localhost:8081` (utilisateur/mot de passe définis dans `docker-compose.yml`).

Structure rapide
- `backend/` : code serveur, scrapers, `nodemon.json` (legacyWatch)
- `prix-malin/` : frontend Vite
- `docker-compose.yml` : services et volumes

Voir les README spécifiques : `backend/README.md` et `prix-malin/README.md`.

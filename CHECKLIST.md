# CHECKLIST — Vérifier et améliorer

Ce fichier recense les points à vérifier, corriger ou durcir dans le projet.

## Priorité — À corriger en premier
- [ ] Nodemon: vérifier que `backend/nodemon.json` fonctionne sous Docker/Windows (polling/legacyWatch).
- [ ] Supprimer les appels réseau au niveau module (pas d'exécution au `import`).
- [ ] Fixer les imports ESM (ex: `cheerio` usage `import { load } from 'cheerio'`).
- [ ] Docker: image `backend` stable (bibliothèques pour Chromium si Puppeteer utilisé).
- [ ] Variables d'environnement: centraliser (`MONGO_URL`, `PORT`, `NODE_ENV`, `USER_AGENT`).
- [ ] Mongo: ajouter index sur `{ store, nom }` pour upsert et recherches rapides.

## Robuste/Fiabilité
- [ ] Gérer les erreurs réseau/timeouts et renvoyer diagnostics utiles.
- [ ] Logs: ajouter niveaux (info/warn/error) et sauvegarder snippets HTML pour diagnostiquer sélecteurs cassés.
- [ ] Déduplication: décider clé d'upsert (actuellement `{store, nom}`) ou historique par extraction.
- [ ] Concurrence: mutex/caching pour éviter scrapes concurrents (déjà présent mais vérifier). 

## Scrapers
- [ ] Vérifier sélecteurs pour chaque site (Leclerc, Hypercacher, etc.) et ajouter fallback selectors.
- [ ] Ajouter tests unitaires pour parsing HTML (ex: fixtures HTML + assertions).
- [ ] Évaluer si Puppeteer est nécessaire; si oui, valider flags de lancement `--no-sandbox` et dépendances OS.

## API / Backend
- [ ] Pagination/filtrage pour `/api/products` (limit/page/store/q).
- [ ] Endpoints pour historique/prix par produit.
- [ ] Auth pour endpoints d'administration (ex: lancer scrapes). 

## Tests & CI
- [ ] Ajouter CI (GitHub Actions) pour linter, tests unitaires et build docker-compose minimal.
- [ ] Tests d'intégration: connecter un MongoDB en CI (ex: service MongoDB) et exécuter `import-hypercacher.js` sur fixture.

## Observabilité & Sécurité
- [ ] Endpoints santé (`/healthz`), métriques (Prometheus) et logs structurés.
- [ ] Limiter fréquence des scrapes pour éviter blocage IP (backoff + throttling).
- [ ] Ne pas stocker secrets en clair; utiliser `.env` + `docker secrets` en prod.

## Améliorations UX / Développer plus tard
- [ ] Endpoint minimal pour frontend (noms uniquement) — option déjà implémentée pour Leclerc.
- [ ] Ajouter documentation `README` pour démarrage local et exécution d'import.

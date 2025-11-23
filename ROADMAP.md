# ROADMAP — Grosses fonctionnalités à ajouter

Ce fichier liste les grandes fonctionnalités à implémenter pour faire évoluer l'application.

# En priorité:
- Hypercacher: recherche un produit, trouve le produit en json et le stocke , catalogue de tous les produits d'hypercah (Structuration bdd + stockage)

## Phase 1 — Persistance & fiabilité
- Persister automatiquement les résultats de chaque extraction dans MongoDB (option `historique` pour conserver chaque exécution).
- Job scheduler (cron / agenda) pour exécuter des scrapers périodiquement.

## Phase 2 — API et backend
- Endpoints REST complets:
  - `/api/products` avec pagination, filtre `store`, recherche `q`, tri.
  - `/api/products/:id/history` pour l'historique des prix d'un produit.
  - Webhooks/ sur variation de prix si ya des promos les ajouter dans une nouvelle page.
- Auth + RBAC pour protéger endpoints d'administration.

## Phase 3 — Frontend utilisateur
- Page liste produits (filtre par magasin, recherche texte).
- Détail produit avec graphique d'historique des prix (Chart.js/Recharts).
- Alertes utilisateurs: abonnement pour recevoir notification (email/push) sur baisse de prix.

## Phase 4 — Observabilité & exploitation
- Monitoring (Prometheus + Grafana) pour métriques de scrapers (durée, erreurs, taux de réussite).
- Logs structurés + traces (opentracing / jaeger) pour diagnostiquer problèmes.
- Dashboard admin pour statut des jobs et des erreurs.

## Phase 5 — Scalabilité & production
- Mettre en place conteneurisation optimisée et Helm chart / compose prod.
- Architectures: worker queue (RabbitMQ / BullMQ) pour exécuter scrapers en parallèle.
- Tests de charge et plan de reprise, sauvegardes Mongo régulières.

## Idées supplémentaires
- Multi-store multi-city (garder l'emplacement/drive comme dimension).
- API publique limitée pour consommation externe (rate-limited).
- Export CSV / intégration Google Sheets.

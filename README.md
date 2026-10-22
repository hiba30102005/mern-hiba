# mern-hiba-tazi

Petite application MERN (MongoDB, Express, HTML/CSS/JS natif, Node.js) pour lister et ajouter des éléments. Frontend sur Vercel, backend déployé sur Vercel et Railway, avec bascule automatique côté frontend.

## Prérequis

- Node.js 18 ou plus récent, npm, Git
- Un cluster MongoDB Atlas de test
- Comptes GitHub, Vercel et Railway

## Installation et commandes

```bash
cd backend
npm install
cp .env.example .env     # puis renseigner les vraies valeurs
npm start                # node index.js
npm run hiba             # nodemon index.js (développement)
```

Frontend : `npx serve frontend -l 5500`, puis ouvrir http://localhost:5500.

## Variables d'environnement (backend)

| Variable | Rôle |
| --- | --- |
| `MONGODB_URI` | URI de connexion MongoDB Atlas (secret) |
| `PORT` | Port d'écoute (fourni par la plateforme, repli 3000) |
| `NODE_ENV` | `development` ou `production` |
| `CORS_ORIGINS` | Origines frontend autorisées, séparées par des virgules |

Vercel et Railway ont chacun leurs propres variables, à configurer séparément.

## Routes API

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Confirme que le serveur répond |
| GET | `/api/items` | Liste les éléments |
| POST | `/api/items` | Crée un élément (`name` obligatoire, `description` optionnelle) |

## Liens de déploiement

- Dépôt GitHub : à compléter
- Frontend Vercel : à compléter
- Backend Vercel : à compléter (`/api/health`)
- Backend Railway : à compléter (`/api/health`)

## Sécurité

Aucun secret n'est versionné (`.env` est dans `.gitignore`). La règle Atlas `0.0.0.0/0` est réservée à l'exercice et sera retirée après l'évaluation.
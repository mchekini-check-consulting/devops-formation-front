# ShopMicro — React E-Commerce Frontend

Application React 18 (SPA) connectée aux microservices catalog, order et payment.

## Lancement rapide

```bash
npm install
cp .env.example .env.local
npm start           # → http://localhost:3000
```

By default the app will call the real microservices. Ensure the catalog service is running on port 4000 (or set `REACT_APP_CATALOG`).

## Docker (build-once + runtime config)

This project builds the static bundle at image build time, and injects runtime API endpoints when the container starts. The image contains a `config.js.template` and an entrypoint that writes `config.js` into the static folder from environment variables.

Example: build the image and run the container with environment variables:

```bash
# build image (creates optimized static bundle inside image)
docker build -t ecommerce-frontend:latest .

# run container and inject endpoints at container start
docker run --rm -p 8080:80 \
  -e CATALOG='https://catalog.example' \
  -e ORDERS='https://orders.example' \
  -e PAYMENT='https://payment.example' \
  ecommerce-frontend:latest
```

The entrypoint will generate `/usr/share/nginx/html/config.js` using the template and the provided environment variables. The app reads `window.__APP_CONFIG__` at runtime so the same image can be reused across environments.

For local development with backend services we also provide a `docker-compose.yml` (dev profile) that starts the three backend services and the frontend. Compose injects service hostnames into the frontend at runtime.

```bash
# start the stack (uses the 'dev' profile frontend)
docker compose --profile dev up --build
```

## Variables d'environnement

| Variable                         | Défaut                  |
| -------------------------------- | ----------------------- |
| `CATALOG` or `REACT_APP_CATALOG` | `http://localhost:4000` |
| `ORDERS` or `REACT_APP_ORDERS`   | `http://localhost:8000` |
| `PAYMENT` or `REACT_APP_PAYMENT` | `http://localhost:8082` |

## Intégration microservices

Le frontend appelle les microservices catalog, order et payment via le client dans `src/lib/api.ts`.

Assurez-vous que les services sont accessibles (voir `CATALOG`, `ORDERS`, `PAYMENT` ou `REACT_APP_*` variables).

## Structure

```
src/
├── lib/
│   ├── api.ts          # Client HTTP pour catalog, order et payment
│   └── cart.tsx        # État panier (React Context)
├── components/
│   ├── layout/Navbar   # Barre de navigation
│   └── pages/
│       ├── CatalogPage # Catalogue + filtres
│       ├── CartPage    # Panier + création commande
│       ├── OrdersPage  # Liste commandes + paiement
│       └── PaymentPage # Historique paiements
├── App.tsx             # Routing interne (state-based)
└── index.css           # Design system complet
```

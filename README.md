# ShopMicro — React E-Commerce Frontend

Application React 18 (SPA) connectée aux microservices catalog, order et payment.

## Lancement en local (dev)

```bash
npm install
npm start           # → http://localhost:3000
```

Le proxy de dev (`proxy.conf.json`) redirige automatiquement les appels API vers les backends locaux :

| Route frontend     | Backend                          |
| ------------------ | -------------------------------- |
| `/api/catalog`     | `http://localhost:4000`          |
| `/api/orders`      | `http://localhost:8000`          |
| `/api/payments`    | `http://localhost:8082`          |

Les 3 backends doivent être  lancé avec `docker compose up --build` dans son propre repo.

## Lancement avec Docker

```bash
# Build l'image
docker build -t ecommerce-frontend:latest .

# Lancer le container
docker run --rm -p 3000:80 \
  -e CATALOG='http://localhost:4000/api/catalog' \
  -e ORDERS='http://localhost:8000/api/orders' \
  -e PAYMENT='http://localhost:8082/api/payments' \
  ecommerce-frontend:latest
```

L'app est accessible sur **http://localhost:3000**. Les backends doivent etre lancer (`docker compose up --build` dans chaque repo).

## Structure

```
src/
├── lib/
│   ├── api.ts          # Client HTTP pour catalog, order et payment
│   ├── http.ts         # buildUrl + doFetch
│   ├── config.ts       # Lecture de window.__APP_CONFIG__
│   └── cart.tsx         # Etat panier (React Context)
├── components/
│   ├── layout/Navbar    # Barre de navigation
│   └── pages/
│       ├── CatalogPage  # Catalogue + filtres
│       ├── CartPage     # Panier + creation commande
│       ├── OrdersPage   # Liste commandes + paiement
│       └── PaymentPage  # Historique paiements
├── App.tsx              # Routing interne (state-based)
└── index.css            # Design system complet
```

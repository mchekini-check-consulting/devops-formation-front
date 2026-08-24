# Observabilité E2E — X-Correlation-ID et X-User-ID

## Objectif

Permettre le suivi d'un flux métier complet (catalogue → commande → paiement) à travers les trois microservices en injectant deux headersd HTTP dans chaque requête émise par le frontend :

| Header | Valeur | Portée |
|---|---|---|
| `X-Correlation-ID` | UUID v4 généré au chargement de la page | Une session = un ID stable |
| `X-User-ID` | Identifiant utilisateur de la session panier | Inchangé pendant la session |

Ces headers sont lus par les microservices (catalog, order, payment) qui les transmettent à leurs logs Winston et aux spans OpenTelemetry / Azure Monitor. Résultat : tous les logs et traces d'un même parcours utilisateur partagent le même `correlationId` et peuvent être filtrés d'un coup dans Azure Monitor.

---

## Fichiers modifiés

### `src/lib/http.ts`

**Avant** : `doFetch()` appelait `fetch()` directement sans headers personnalisés.

**Après** : un store module-level `_trace` contient le `correlationId` (généré une fois via `crypto.randomUUID()`) et le `userId`. `doFetch()` les injecte automatiquement dans chaque requête.

```ts
// store initialisé au chargement du module JS (une fois par onglet)
const _trace = {
  correlationId: crypto.randomUUID(),
  userId: "",
};

// appelé par cart.tsx au démarrage
export function setUserId(userId: string) {
  _trace.userId = userId;
}

// injection transparente dans chaque fetch
const traceHeaders = {
  "X-Correlation-ID": _trace.correlationId,
  "X-User-ID": _trace.userId,        // omis si vide
};
```

**Pourquoi au niveau module** : le store est partagé par tous les appels `doFetch()` sans modifier `api.ts` ni aucune page. Un seul endroit à maintenir.

---

### `src/lib/cart.tsx`

**Avant** : `userId` généré dans l'état initial du reducer React, jamais communiqué à la couche HTTP.

**Après** : `_initialUserId` est généré **hors composant** (niveau module) et enregistré immédiatement dans `http.ts` via `setUserId()`.

```ts
const _initialUserId = "user-" + Math.random().toString(36).slice(2, 8);
setUserId(_initialUserId);   // enregistrement synchrone avant tout appel API
```

**Pourquoi hors composant** : garantit que `setUserId` est appelé une seule fois, même si `CartProvider` re-render. L'`userId` ne change jamais durant la session.

---

## Fichiers non modifiés

- `src/lib/api.ts` — les services catalog, order et payment n'ont pas besoin d'être touchés
- `src/components/pages/*` — aucune page ne passe les headers manuellement, l'injection est transparente

---

## Flux e2e instrumenté

```
Utilisateur                Frontend                  Microservices
    │                          │
    │── Parcourt le catalogue ──▶ GET /api/catalog
    │                          │   X-Correlation-ID: a1b2-c3d4-...
    │                          │   X-User-ID: user-x4k9z
    │                          │
    │── Valide le panier ───────▶ POST /api/orders
    │                          │   X-Correlation-ID: a1b2-c3d4-...   ← même ID
    │                          │   X-User-ID: user-x4k9z
    │                          │
    │── Paye ───────────────────▶ POST /api/payments
    │                          │   X-Correlation-ID: a1b2-c3d4-...   ← même ID
    │                          │   X-User-ID: user-x4k9z
    │                          │
    │                          │──▶ PATCH /api/orders/:id             ← même ID
```

Dans Azure Monitor, filtrer sur `correlation.id = "a1b2-c3d4-..."` retourne tous les logs et traces des trois services pour ce parcours d'achat.

---

## Durée de vie du correlationId

| Événement | Comportement |
|---|---|
| Chargement / rechargement de la page | Nouvel UUID généré |
| Navigation entre pages | Même UUID conservé |
| Ajout au panier, commande, paiement | Même UUID conservé |
| Ouverture d'un nouvel onglet | UUID indépendant (nouveau module JS) |
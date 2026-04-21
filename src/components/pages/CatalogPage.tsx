import React, { useEffect, useState, useCallback } from "react";
import { catalogService } from "../../lib/api";
import type { Product } from "../../types/api";
import { ApiError } from "../../lib/api";
import { CATEGORIES } from "../../lib/constants";
import { useCart } from "../../lib/cart";
import SearchIcon from "../icons/SearchIcon";
import CartPlusIcon from "../icons/CartPlusIcon";
import CheckIcon from "../icons/CheckIcon";
import PackageIcon from "../icons/PackageIcon";
import { AlertIcon } from "../icons";

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  const { state } = useCart();
  const inCart = state.items.some((i) => i.product.id === product.id);

  const catColors: Record<string, string> = {
    Informatique: "badge-primary",
    Audio: "badge-warning",
    Tablettes: "badge-primary",
    Smartphones: "badge-success",
    Moniteurs: "badge-gray",
    Périphériques: "badge-gray",
    Stockage: "badge-warning",
  };

  return (
    <div
      className="card product-card"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Product image placeholder */}
      <div
        style={{
          height: 100,
          background:
            "linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PackageIcon />
      </div>

      <div
        className="card-body"
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div className="d-flex align-center justify-between">
          <span
            className={`badge ${catColors[product.category] || "badge-gray"}`}
          >
            {product.category}
          </span>
          <span className="text-xs font-mono text-muted">
            #{product.id.slice(-4).toUpperCase()}
          </span>
        </div>

        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--gray-900)",
              lineHeight: 1.3,
              marginBottom: 4,
            }}
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-muted" style={{ lineHeight: 1.5 }}>
              {product.description}
            </p>
          )}
        </div>

        {product.stock !== undefined && (
          <p
            className="text-xs"
            style={{
              color: product.stock < 10 ? "var(--red)" : "var(--gray-400)",
            }}
          >
            {product.stock < 10
              ? `⚠ Plus que ${product.stock} en stock`
              : `✓ ${product.stock} en stock`}
          </p>
        )}

        <div
          className="d-flex align-center justify-between mt-auto"
          style={{ marginTop: "auto", paddingTop: 12 }}
        >
          <span
            style={{ fontSize: 20, fontWeight: 800, color: "var(--gray-900)" }}
          >
            {fmt(product.price)}
          </span>
          <button
            onClick={onAdd}
            className={
              inCart ? "btn btn-success btn-sm" : "btn btn-primary btn-sm"
            }
          >
            {inCart ? (
              <>
                <CheckIcon /> Ajouté
              </>
            ) : (
              <>
                <CartPlusIcon /> Ajouter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="skeleton" style={{ height: 100 }} />
      <div
        className="card-body"
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <div className="skeleton" style={{ height: 20, width: "40%" }} />
        <div className="skeleton" style={{ height: 16, width: "80%" }} />
        <div className="skeleton" style={{ height: 14, width: "60%" }} />
        <div className="skeleton" style={{ height: 14, width: "70%" }} />
        <div className="d-flex justify-between align-center mt-3">
          <div className="skeleton" style={{ height: 24, width: 80 }} />
          <div className="skeleton" style={{ height: 32, width: 90 }} />
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const { dispatch } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [errorToasts, setErrorToasts] = useState<
    Array<{ id: number; msg: string }>
  >([]);

  function pushErrorToast(message: string, ttl = 4500) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setErrorToasts((s) => [...s, { id, msg: message }]);
    setTimeout(() => {
      setErrorToasts((s) => s.filter((t) => t.id !== id));
    }, ttl);
  }

  const load = useCallback(
    async (q?: string, cat?: string, min?: string, max?: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await catalogService.getProducts({
          name: q || undefined,
          category: cat && cat !== "Tous" ? cat : undefined,
          minPrice: min ? parseFloat(min) : undefined,
          maxPrice: max ? parseFloat(max) : undefined,
        });
        setProducts(data);
      } catch (err: any) {
        // If backend returned structured validation errors, show them as toasts
        if (err instanceof ApiError && err.payload) {
          const payload = err.payload;
          // payload may be an array of validation issues or a single object
          if (Array.isArray(payload)) {
            payload.forEach((p: any) =>
              pushErrorToast(
                `${p.path || p.location || "field"}: ${
                  p.msg || p.message || JSON.stringify(p)
                }`
              )
            );
          } else if (payload && typeof payload === "object") {
            if (payload.errors && Array.isArray(payload.errors)) {
              payload.errors.forEach((p: any) =>
                pushErrorToast(
                  `${p.path || p.location || "field"}: ${
                    p.msg || p.message || JSON.stringify(p)
                  }`
                )
              );
            } else if (payload.msg || payload.message) {
              pushErrorToast(payload.msg || payload.message);
            } else {
              pushErrorToast(JSON.stringify(payload));
            }
          } else if (typeof payload === "string") {
            pushErrorToast(payload);
          }
          setError(
            "Le catalog-service a retourné des erreurs. Consultez les notifications."
          );
        } else {
          setError(
            "Impossible de joindre le catalog-service. Vérifiez que le service est démarré sur le port 4000."
          );
          pushErrorToast(
            "Erreur réseau: impossible de joindre le catalog-service"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(search, category, minPrice, maxPrice);
  }

  function handleAdd(product: Product) {
    dispatch({ type: "ADD", product });
    setToast(`${product.name} ajouté au panier`);
    setTimeout(() => setToast(null), 2500);
  }

  function handleCatChange(cat: string) {
    setCategory(cat);
    load(search, cat, minPrice, maxPrice);
  }

  function handleReset() {
    setSearch("");
    setCategory("Tous");
    setMinPrice("");
    setMaxPrice("");
    load("", "Tous", "", "");
  }

  return (
    <>
      {/* Toast */}
      {(toast || errorToasts.length > 0) && (
        <div className="toast-wrap">
          {toast && (
            <div className="toast toast-success">
              <CheckIcon size={15} />
              {toast}
            </div>
          )}

          {errorToasts.map((t) => (
            <div key={t.id} className="toast toast-error">
              <AlertIcon size={15} />
              {t.msg}
            </div>
          ))}
        </div>
      )}

      {/* Page header */}
      <div className="page-header">
        <div className="breadcrumb">
          <span>catalog-service</span>
          <span>›</span>
          <span>GET /products</span>
        </div>
        <h1>Catalogue produits</h1>
        <p>
          {products.length} produit{products.length !== 1 ? "s" : ""} disponible
          {products.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search + filters */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="grid-2" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Recherche</label>
                <div style={{ position: "relative" }}>
                  <span className="input-icon">
                    <SearchIcon />
                  </span>
                  <input
                    className="form-control input-with-icon"
                    placeholder="Nom du produit..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select
                  className="form-control form-select"
                  value={category}
                  onChange={(e) => handleCatChange(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Prix min (€)</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prix max (€)</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="9999"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                <SearchIcon />
                Rechercher
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleReset}
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger mb-4">
          <AlertIcon />
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <PackageIcon />
          <h3>Aucun produit trouvé</h3>
          <p>Essayez d'autres critères de recherche</p>
        </div>
      ) : (
        <div className="grid-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={() => handleAdd(p)} />
          ))}
        </div>
      )}
    </>
  );
}

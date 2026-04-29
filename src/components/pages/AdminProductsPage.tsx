import React, { useEffect, useState } from "react";
import { catalogService, ApiError } from "../../lib/api";
import type { Product, CreateProductPayload } from "../../types/api";
import { CATEGORIES } from "../../lib/constants";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Informatique");
  const [description, setDescription] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogService.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError("Impossible de charger la liste des produits");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: CreateProductPayload = {
      name,
      price: parseFloat(price || "0"),
      category,
      description: description || undefined,
    };

    try {
      const created = await catalogService.createProduct(payload);
      setProducts((s) => [created, ...s]);
      // reset
      setName("");
      setPrice("");
      setCategory("Informatique");
      setDescription("");
    } catch (err: any) {
      if (err instanceof ApiError && err.payload) {
        setError(
          "Erreur API: " + (err.payload.message || JSON.stringify(err.payload))
        );
      } else {
        setError("Erreur lors de la création du produit");
      }
    }
  }

  async function handleDelete(id: string) {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await catalogService.deleteProduct(id);
      setProducts((s) => s.filter((p) => p.id !== id));
    } catch (err: any) {
      setError("Erreur lors de la suppression");
      console.error(err);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb">
          <span>catalog-service</span>
          <span>›</span>
          <span>Admin</span>
        </div>
        <h1>Gestion des produits</h1>
        <p>Créer et supprimer des produits</p>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <form
            onSubmit={handleAdd}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <input
              className="form-control"
              placeholder="Nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="form-control"
              placeholder="Prix"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <select
              className="form-control form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.filter((c) => c !== "Tous").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              className="form-control"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ gridColumn: "1 / -1" }}
            />
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
              <button className="btn btn-primary" type="submit">
                Ajouter
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setName("");
                  setPrice("");
                  setCategory("Informatique");
                  setDescription("");
                }}
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="card">
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Prix</th>
                  <th>Catégorie</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="text-xs text-muted">{p.id}</td>
                    <td>{p.name}</td>
                    <td>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(p.price)}
                    </td>
                    <td>{p.category}</td>
                    <td>{p.stock ?? "-"}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import "./index.css";
import { CartProvider } from "./lib/cart";
import Sidebar from "./components/layout/Sidebar";
import CatalogPage from "./components/pages/CatalogPage";
import CartPage from "./components/pages/CartPage";
import OrdersPage from "./components/pages/OrdersPage";
import PaymentPage from "./components/pages/PaymentPage";
import AdminProductsPage from "./components/pages/AdminProductsPage";

export type Page = "catalog" | "cart" | "orders" | "payment" | "admin";

function RateLimitBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleRateLimit() {
      setVisible(true);
      setTimeout(() => setVisible(false), 8000);
    }
    window.addEventListener("api:rate-limit", handleRateLimit);
    return () => window.removeEventListener("api:rate-limit", handleRateLimit);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#d32f2f",
        color: "#fff",
        padding: "14px 24px",
        textAlign: "center",
        fontWeight: 600,
        fontSize: "0.95rem",
        boxShadow: "0 2px 8px rgba(0,0,0,.25)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span>
        Vous avez atteint le nombre de requêtes maximales par minute, réessayez
        plus tard.
      </span>
      <button
        onClick={() => setVisible(false)}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,.5)",
          color: "#fff",
          borderRadius: 4,
          padding: "4px 12px",
          cursor: "pointer",
          fontSize: "0.85rem",
        }}
      >
        Fermer
      </button>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("catalog");
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);

  function goToOrders(orderId?: string) {
    setHighlightOrderId(orderId || null);
    setPage("orders");
  }

  return (
    <CartProvider>
      <RateLimitBanner />
      <div className="min-h-screen" style={{ background: "var(--background)" }}>
        <Sidebar page={page} setPage={setPage} />
        <main className="main-content">
          <div className="main-container">
            {page === "catalog" && <CatalogPage />}
            {page === "cart" && <CartPage goToOrders={goToOrders} />}
            {page === "orders" && (
              <OrdersPage highlightOrderId={highlightOrderId} />
            )}
            {page === "payment" && <PaymentPage />}
            {page === "admin" && <AdminProductsPage />}
          </div>
        </main>
      </div>
    </CartProvider>
  );
}

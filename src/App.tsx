import React, { useState } from "react";
import "./index.css";
import { CartProvider } from "./lib/cart";
import Navbar from "./components/layout/Navbar";
import CatalogPage from "./components/pages/CatalogPage";
import CartPage from "./components/pages/CartPage";
import OrdersPage from "./components/pages/OrdersPage";
import PaymentPage from "./components/pages/PaymentPage";
import AdminProductsPage from "./components/pages/AdminProductsPage";

export type Page = "catalog" | "cart" | "orders" | "payment" | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("catalog");
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);

  function goToOrders(orderId?: string) {
    setHighlightOrderId(orderId || null);
    setPage("orders");
  }

  return (
    <CartProvider>
      <Navbar page={page} setPage={setPage} />
      <div className="container page">
        {page === "catalog" && <CatalogPage />}
        {page === "cart" && <CartPage goToOrders={goToOrders} />}
        {page === "orders" && (
          <OrdersPage highlightOrderId={highlightOrderId} />
        )}
        {page === "payment" && <PaymentPage />}
        {page === "admin" && <AdminProductsPage />}
      </div>
    </CartProvider>
  );
}

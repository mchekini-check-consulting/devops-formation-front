import React from "react";
import { Page } from "../../App";
import { useCart } from "../../lib/cart";
import { getUsername, logout } from "../../services/keycloak";
import ShopIcon from "../icons/ShopIcon";
import GridIcon from "../icons/GridIcon";
import BoxIcon from "../icons/BoxIcon";
import CreditIcon from "../icons/CreditIcon";
import CardIcon from "../icons/CardIcon";

interface NavbarProps {
  page: Page;
  setPage: (p: Page) => void;
}

export default function Navbar({ page, setPage }: NavbarProps) {
  const { count } = useCart();
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <button
            className="navbar-brand"
            onClick={() => setPage("catalog")}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontFamily: "var(--font)",
            }}
            aria-label="Aller au catalogue"
          >
            <ShopIcon />
            ShopMicro
            <span>E-Commerce Platform</span>
          </button>

          <div className="navbar-nav">
            <button
              className={`nav-link${page === "catalog" ? " active" : ""}`}
              onClick={() => setPage("catalog")}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "var(--font)",
              }}
            >
              <GridIcon /> Catalogue
            </button>
            <button
              className={`nav-link${page === "admin" ? " active" : ""}`}
              onClick={() => setPage("admin")}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "var(--font)",
              }}
            >
              <BoxIcon /> Admin
            </button>
            <button
              className={`nav-link${page === "orders" ? " active" : ""}`}
              onClick={() => setPage("orders")}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "var(--font)",
              }}
            >
              <BoxIcon /> Commandes
            </button>
            <button
              className={`nav-link${page === "payment" ? " active" : ""}`}
              onClick={() => setPage("payment")}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "var(--font)",
              }}
            >
              <CreditIcon /> Paiements
            </button>
            <button
              className={`nav-link nav-badge${
                page === "cart" ? " active" : ""
              }`}
              onClick={() => setPage("cart")}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "var(--font)",
                marginLeft: 4,
              }}
            >
              <CardIcon />
              Panier
              {count > 0 && <span className="nav-badge-count">{count}</span>}
            </button>

            <span
              style={{
                marginLeft: 16,
                color: "var(--muted)",
                fontSize: "0.9rem",
              }}
            >
              {getUsername()}
            </span>
            <button
              className="nav-link"
              onClick={() => logout()}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "var(--font)",
                color: "var(--danger, #e74c3c)",
              }}
            >
              Deconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

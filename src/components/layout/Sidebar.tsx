import React from "react";
import { Page } from "../../App";
import { useCart } from "../../lib/cart";
import ShopIcon from "../icons/ShopIcon";
import GridIcon from "../icons/GridIcon";
import BoxIcon from "../icons/BoxIcon";
import CreditIcon from "../icons/CreditIcon";
import CardIcon from "../icons/CardIcon";
import SettingsIcon from "../icons/SettingsIcon";

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
}

const navItems: { page: Page; label: string; icon: React.FC<{ size?: number }> }[] = [
  { page: "catalog", label: "Catalogue", icon: GridIcon },
  { page: "cart", label: "Panier", icon: CardIcon },
  { page: "orders", label: "Commandes", icon: BoxIcon },
  { page: "payment", label: "Paiements", icon: CreditIcon },
  { page: "admin", label: "Admin", icon: SettingsIcon },
];

export default function Sidebar({ page, setPage }: SidebarProps) {
  const { count } = useCart();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <button
        className="sidebar-brand"
        onClick={() => setPage("catalog")}
        aria-label="Aller au catalogue"
      >
        <div className="sidebar-brand-icon">
          <ShopIcon size={20} />
        </div>
        <div className="sidebar-brand-text">
          <h1>ShopMicro</h1>
          <p>E-Commerce Platform</p>
        </div>
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = page === item.page;
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              className={`sidebar-link${isActive ? " active" : ""}`}
              onClick={() => setPage(item.page)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.page === "cart" && count > 0 && (
                <span className="sidebar-badge">{count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <p>ShopMicro v1.0</p>
      </div>
    </aside>
  );
}

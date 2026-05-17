import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Product } from "../types/api";
import { setUserId } from "./http";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface State {
  items: CartItem[];
  userId: string;
}

type Action =
  | { type: "ADD"; product: Product }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "CLEAR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id
      );
      if (existing)
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: 1 }],
      };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((i) => i.product.id !== action.id),
      };
    case "SET_QTY":
      if (action.qty <= 0)
        return {
          ...state,
          items: state.items.filter((i) => i.product.id !== action.id),
        };
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.id ? { ...i, quantity: action.qty } : i
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

const Ctx = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  total: number;
  count: number;
} | null>(null);

const _initialUserId = "anonymous";
setUserId(_initialUserId);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    userId: _initialUserId,
  });
  const total = state.items.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0
  );
  const count = state.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <Ctx.Provider value={{ state, dispatch, total, count }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart outside CartProvider");
  return ctx;
}

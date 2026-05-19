import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initKeycloak } from "./services/keycloak";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

initKeycloak()
  .then((authenticated) => {
    if (authenticated) {
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } else {
      root.render(<p>Authentification requise. Redirection...</p>);
    }
  })
  .catch((err) => {
    console.error("Keycloak init failed", err);
    root.render(<p>Impossible de se connecter au service d'authentification.</p>);
  });

// Polyfill crypto.randomUUID pour contexte HTTP (non-secure).
// En HTTPS, tout est natif et ce fichier ne fait rien.

if (typeof crypto !== "undefined" && !crypto.randomUUID) {
  (crypto as any).randomUUID = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
}

export {};

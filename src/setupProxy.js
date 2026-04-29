const { createProxyMiddleware } = require("http-proxy-middleware");
const fs = require("fs");
const path = require("path");

// Only register proxies in development — CRA loads this file only for dev,
// but being defensive avoids surprises if the file is ever imported elsewhere.
const isDev = process.env.NODE_ENV === "development";

function loadProxyConfig() {
  const configPath = path.resolve(__dirname, "../proxy.conf.json");
  if (!fs.existsSync(configPath)) return null;
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("setupProxy: failed to parse proxy.conf.json:", err);
    return null;
  }
}

function normalizeOptions(options) {
  if (typeof options === "string")
    return { target: options, changeOrigin: true };
  if (typeof options === "object" && options !== null) return options;
  return null;
}

module.exports = function (app) {
  if (!isDev) {
    // no-op outside development
    // eslint-disable-next-line no-console
    console.info(
      "setupProxy: not in development mode — skipping proxy registration"
    );
    return;
  }

  const cfg = loadProxyConfig();
  const fallback = {
    "/api": {
      target: "http://localhost:8082",
      secure: false,
      changeOrigin: true,
    },
  };
  const proxyConfig = cfg || fallback;

  Object.entries(proxyConfig).forEach(([context, rawOptions]) => {
    const options = normalizeOptions(rawOptions);
    if (!options || !options.target) {
      // eslint-disable-next-line no-console
      console.warn(
        `setupProxy: invalid proxy config for context '${context}', skipping`
      );
      return;
    }

    // create and mount the proxy middleware
    try {
      const middleware = createProxyMiddleware(options);
      app.use(context, middleware);
      // eslint-disable-next-line no-console
      console.info(
        `setupProxy: registered proxy ${context} -> ${options.target}`
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `setupProxy: failed to register proxy for ${context}:`,
        err
      );
    }
  });
};

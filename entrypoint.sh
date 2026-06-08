#!/bin/sh
set -e

HTML_DIR=/usr/share/nginx/html
TEMPLATE=${HTML_DIR}/config.js.template
OUT=${HTML_DIR}/config.js

if [ -f "$TEMPLATE" ]; then
  echo "Generating runtime config at $OUT"
  # Provide sensible defaults if not set; allow REACT_APP_* fallbacks
  : "${CATALOG:=http://localhost:4000}"
  : "${ORDERS:=http://localhost:8000}"
  : "${PAYMENT:=http://localhost:8082}"
  : "${KEYCLOAK_URL:=http://localhost:8080}"
  : "${KEYCLOAK_REALM:=ecommerce}"
  : "${KEYCLOAK_CLIENT_ID:=ecommerce-front}"
  : "${AUTH_ENABLED:=true}"

  CATALOG=${CATALOG:-$REACT_APP_CATALOG}
  ORDERS=${ORDERS:-$REACT_APP_ORDERS}
  PAYMENT=${PAYMENT:-$REACT_APP_PAYMENT}

  export CATALOG ORDERS PAYMENT KEYCLOAK_URL KEYCLOAK_REALM KEYCLOAK_CLIENT_ID AUTH_ENABLED

  # Use envsubst (from gettext) to substitute ${VAR} placeholders in the template
  envsubst '\$CATALOG \$ORDERS \$PAYMENT \$KEYCLOAK_URL \$KEYCLOAK_REALM \$KEYCLOAK_CLIENT_ID \$AUTH_ENABLED' < "$TEMPLATE" > "$OUT"
else
  echo "No config template found at $TEMPLATE, skipping runtime config generation"
fi

exec "$@"

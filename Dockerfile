# ── Stage 1: build ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install
ENV NODE_ENV=development
COPY . .
RUN npm run build

# ── Stage 2: serve ─────────────────────────────────────────────
FROM nginx:alpine AS runner

# Cache-bust this layer so `apk upgrade` re-hits the package index every build,
# instead of replaying a stale cached layer (GHA cache pins layers by instruction
# text + parent digest, which doesn't know new CVE fixes landed upstream).
ARG APK_CACHE_BUST=1

# Update base packages (fix CVEs) + install gettext for envsubst
RUN apk upgrade --no-cache && apk add --no-cache gettext
ENV NODE_ENV=development
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/public/config.js.template /usr/share/nginx/html/config.js.template
COPY entrypoint.sh /entrypoint.sh

# Fix Windows line endings and make executable
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

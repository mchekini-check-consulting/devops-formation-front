# ── Stage 1: build ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: serve ─────────────────────────────────────────────
FROM nginx:alpine AS runner
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the runtime config template and entrypoint
COPY --from=builder /app/public/config.js.template /usr/share/nginx/html/config.js.template
COPY --from=builder /app/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

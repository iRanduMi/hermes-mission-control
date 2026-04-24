# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Prod stage ----
FROM nginx:alpine
LABEL maintainer="jared.kortje"
LABEL org.opencontainers.image.source="https://github.com/jaredkortje/hermes-mission-control"

# Custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

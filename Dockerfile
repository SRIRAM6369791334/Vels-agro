# Stage 1: Build Frontend SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY frontend/package*.json ./
RUN npm ci || npm install

# Copy source code and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Clear default static files
RUN rm -rf ./*

# Copy build artifacts from builder
COPY --from=builder /app/dist .

# Copy Nginx configuration and entrypoint
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Render exposes dynamic PORT (defaults to 80/10000)
EXPOSE 80 10000

ENTRYPOINT ["/docker-entrypoint.sh"]

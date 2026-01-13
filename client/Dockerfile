# ---- Build step ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Run step (serve static) ----
FROM nginx:alpine

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback for React Router (so refresh /route works)
RUN printf '%s\n' \
'server {' \
'  listen 80;' \
'  server_name _;' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'  location / { try_files $uri $uri/ /index.html; }' \
'}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

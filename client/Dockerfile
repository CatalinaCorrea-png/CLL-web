# ---- Build step ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Run step (serve static) ----
FROM nginx:alpine

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback + static assets caching
RUN printf '%s\n' \
'server {' \
'  listen 80;' \
'  server_name _;' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'' \
'  location ~* \.(webp|png|jpe?g|gif|svg|ico|css|js|woff2?)$ {' \
'    try_files $uri =404;' \
'    expires 30d;' \
'    add_header Cache-Control "public, max-age=2592000, immutable";' \
'    access_log off;' \
'  }' \
'' \
'  # SPA fallback (React Router)' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' \
> /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM node:20-alpine

WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# If you have a build step (TypeScript), swap this accordingly:
# RUN npm run build
# CMD ["node", "dist/index.js"]

CMD ["npm", "run", "start"]

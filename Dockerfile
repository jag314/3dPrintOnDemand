FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server/ ./server/
# Cache bust: actualizar este número con cada deploy importante
ARG CACHE_BUST=2
EXPOSE 3001
CMD ["node", "server/index.js"]

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json backend/
RUN npm ci --workspace=@grc/backend 2>/dev/null || npm install --workspace=@grc/backend
COPY backend/ backend/
RUN npm run build --workspace=@grc/backend

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
USER node
CMD ["node", "dist/index.js"]

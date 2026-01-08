# =========================
# Stage 1: Build
# =========================
FROM --platform=linux/amd64 node:lts-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

COPY src/views ./dist/views

# =========================
# Stage 2: Runtime
# =========================
FROM --platform=linux/amd64 node:22-alpine AS final

RUN addgroup app && adduser -S -G app app
WORKDIR /app
RUN chown -R app:app /app
USER app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./

RUN npm ci --omit=dev

EXPOSE 8080

CMD ["node", "index.js"]
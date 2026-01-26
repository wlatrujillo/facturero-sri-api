# Stage 1: Build
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/facturero-sri-api/package*.json ./packages/facturero-sri-api/
COPY packages/facturero-sri-signer/package*.json ./packages/facturero-sri-signer/

# Install dependencies
RUN npm ci

# Copy TypeScript config and source files
COPY tsconfig.json ./
COPY packages/facturero-sri-api/tsconfig.json ./packages/facturero-sri-api/
COPY packages/facturero-sri-signer/tsconfig.json ./packages/facturero-sri-signer/
COPY packages/facturero-sri-api/src ./packages/facturero-sri-api/src
COPY packages/facturero-sri-signer/src ./packages/facturero-sri-signer/src

# Build the project
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/facturero-sri-api/package*.json ./packages/facturero-sri-api/
COPY packages/facturero-sri-signer/package*.json ./packages/facturero-sri-signer/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/packages/facturero-sri-api/dist ./packages/facturero-sri-api/dist
COPY --from=builder /app/packages/facturero-sri-signer/dist ./packages/facturero-sri-signer/dist

# Copy views directory (for Handlebars templates) to dist folder
COPY packages/facturero-sri-api/src/views ./packages/facturero-sri-api/dist/views

# Copy source files needed for Swagger documentation
COPY packages/facturero-sri-api/src/routes ./packages/facturero-sri-api/src/routes
COPY packages/facturero-sri-api/src/dtos ./packages/facturero-sri-api/src/dtos

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "packages/facturero-sri-api/dist/index.js"]

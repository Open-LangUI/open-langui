# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app

# Install all dependencies (including devDependencies for build)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build app (needs devDependencies)
FROM deps AS build
COPY . .
RUN npm run build

# Runtime: only production deps
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy build artifacts from build stage
COPY --from=build /app/build ./build

# SQLite data dir
RUN mkdir -p /app/data

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node", "build/index.js"]
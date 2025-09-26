# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build the app
FROM deps AS build
COPY . .
RUN npm run build

# Runtime image
FROM base AS runner
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy build output
COPY --from=build /app/build ./build

# Ensure SQLite data folder exists
RUN mkdir -p /app/data

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["node", "build/index.js"]
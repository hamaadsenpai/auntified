# syntax=docker/dockerfile:1.7

FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# public/ is empty and empty dirs don't survive the upload; the runner copies it.
RUN mkdir -p public
# Config comes from the committed .env.production (standalone output copies it, so the
# server reads it at runtime too). The secret keys come in as a BuildKit secret mounted
# as .env.production.local: present while prerendering, never copied or kept in a layer.
RUN --mount=type=secret,id=dotenv,target=/app/.env.production.local,required=true \
    npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 8080
CMD ["node", "server.js"]

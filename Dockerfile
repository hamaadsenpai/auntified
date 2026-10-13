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
# Build-time env comes in as a BuildKit secret (an .env file), so NEXT_PUBLIC_* get
# inlined and server vars exist while prerendering, without landing in an image layer.
# Standalone output copies loaded .env files, so strip them in the same step.
RUN --mount=type=secret,id=dotenv,target=/app/.env.production,required=true \
    npm run build && rm -f .next/standalone/.env*

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

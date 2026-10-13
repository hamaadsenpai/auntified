#!/usr/bin/env bash
# Build on Cloud Build and deploy to Cloud Run.
# Build-time env: .env.local with NEXT_PUBLIC_APP_URL pointed at the service URL.
# Runtime env: the non-NEXT_PUBLIC_ vars from .env.local, set on the service.
# The keys in SECRETS are not uploaded from .env.local; they come from Secret Manager
# (see cloudbuild.yaml). Rotate with: gcloud secrets versions add <secret> --data-file=-
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT=drinking-game-sl
REGION=asia-south1
SERVICE=auntified
APP_URL=${APP_URL:-https://auntified-yulgai7tga-el.a.run.app}
IMAGE="$REGION-docker.pkg.dev/$PROJECT/cloud-run-source-deploy/$SERVICE:$(date +%Y%m%d-%H%M%S)"

# env var -> Secret Manager secret
SECRETS="FIREBASE_PRIVATE_KEY=auntified-firebase-private-key:latest,GEMINI_API_KEY=auntified-gemini-api-key:latest"
SECRET_KEYS="^(FIREBASE_PRIVATE_KEY|GEMINI_API_KEY)="

RUNTIME_ENV=$(mktemp)
trap 'rm -f .env.deploy "$RUNTIME_ENV"' EXIT

{ grep -v -E "^NEXT_PUBLIC_APP_URL=|$SECRET_KEYS" .env.local; echo "NEXT_PUBLIC_APP_URL=$APP_URL"; } > .env.deploy

node -e '
const { parseEnv } = require("util");
const env = parseEnv(require("fs").readFileSync(".env.local", "utf8"));
for (const [k, v] of Object.entries(env))
  if (!k.startsWith("NEXT_PUBLIC_") && !new RegExp(process.argv[1]).test(k + "=")) console.log(`${k}: ${JSON.stringify(v)}`);
' "$SECRET_KEYS" > "$RUNTIME_ENV"

gcloud builds submit --project "$PROJECT" --region "$REGION" \
  --config cloudbuild.yaml --substitutions "_IMAGE=$IMAGE" .

gcloud run deploy "$SERVICE" --project "$PROJECT" --region "$REGION" \
  --image "$IMAGE" --env-vars-file "$RUNTIME_ENV" --set-secrets "$SECRETS" --port 8080

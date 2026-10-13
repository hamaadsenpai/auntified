#!/usr/bin/env bash
# Build and deploy the working tree without pushing to main (the push trigger runs
# the same cloudbuild.yaml). Config: .env.production. Secret keys: Secret Manager.
# Rotate a key with: gcloud secrets versions add <secret> --data-file=-
set -euo pipefail
cd "$(dirname "$0")/.."

gcloud builds submit --project drinking-game-sl --region asia-south1 \
  --config cloudbuild.yaml \
  --service-account projects/drinking-game-sl/serviceAccounts/140661425155-compute@developer.gserviceaccount.com .

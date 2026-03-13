#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.ec2"
COMPOSE_FILE="${ROOT_DIR}/docker/compose.ec2.yml"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo ".env.ec2 not found. Copy .env.ec2.example to .env.ec2 and fill in real values."
  exit 1
fi

cd "${ROOT_DIR}"

docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --build

if [[ "${1:-}" == "--seed" ]]; then
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T backend npm run prisma:seed
fi

echo "Deployment complete."
echo "Frontend: ${CLIENT_ORIGIN:-set CLIENT_ORIGIN in .env.ec2}"
echo "Tip: use 'docker compose --env-file .env.ec2 -f docker/compose.ec2.yml logs -f' to inspect runtime logs."

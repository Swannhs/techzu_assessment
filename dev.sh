#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILES=(
  "-f" "${ROOT_DIR}/docker/compose.yml"
  "-f" "${ROOT_DIR}/docker/compose.dev.yml"
)

FOLLOW_LOGS=false

for arg in "$@"; do
  case "$arg" in
    --logs)
      FOLLOW_LOGS=true
      ;;
    *)
      echo "Unknown option: $arg" >&2
      echo "Usage: ./dev.sh [--logs]" >&2
      exit 1
      ;;
  esac
done

compose() {
  docker compose "${COMPOSE_FILES[@]}" "$@"
}

echo "Starting development stack..."
compose up -d --build

echo "Waiting for PostgreSQL to become ready..."
until compose exec -T postgres pg_isready -U postgres -d fnb_hq >/dev/null 2>&1; do
  sleep 2
done

echo "Generating Prisma client..."
compose exec -T backend npx prisma generate

echo "Applying database migrations..."
compose exec -T backend npx prisma migrate deploy

echo "Seeding development data..."
compose exec -T backend npm run prisma:seed

echo
echo "Development stack is ready."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:4000/api"
echo "Postgres: postgresql://postgres:postgres@localhost:5432/fnb_hq"

if [[ "$FOLLOW_LOGS" == "true" ]]; then
  echo
  echo "Following frontend and backend logs..."
  compose logs -f frontend backend
fi

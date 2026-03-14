#!/usr/bin/env bash

set -euo pipefail

RELEASE_ID="${1:?release id is required}"
ARCHIVE_PATH="${2:?archive path is required}"
APP_ROOT="${APP_ROOT:-/opt/fnb-hq}"
RELEASE_ROOT="${APP_ROOT}/releases"
RELEASE_DIR="${RELEASE_ROOT}/${RELEASE_ID}"
SHARED_ENV_FILE="${APP_ROOT}/shared/.env.ec2"

if [[ ! -f "${ARCHIVE_PATH}" ]]; then
  echo "Archive not found: ${ARCHIVE_PATH}"
  exit 1
fi

if [[ ! -f "${SHARED_ENV_FILE}" ]]; then
  echo "Shared env file not found: ${SHARED_ENV_FILE}"
  echo "Create it once on the EC2 instance before running the deployment workflow."
  exit 1
fi

mkdir -p "${RELEASE_ROOT}" "${APP_ROOT}/shared"
rm -rf "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}"

tar -xzf "${ARCHIVE_PATH}" -C "${RELEASE_DIR}"
ln -sfn "${SHARED_ENV_FILE}" "${RELEASE_DIR}/.env.ec2"

cd "${RELEASE_DIR}"

export COMPOSE_PROJECT_NAME=fnb_hq
COMPOSE_ARGS=(--env-file .env.ec2 -f docker/compose.ec2.yml)

wait_for_service_health() {
  local service_name="$1"
  local timeout_seconds="${2:-180}"
  local elapsed=0

  while (( elapsed < timeout_seconds )); do
    local container_id
    container_id="$(docker compose "${COMPOSE_ARGS[@]}" ps -q "${service_name}")"

    if [[ -n "${container_id}" ]]; then
      local health_status
      health_status="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${container_id}")"

      if [[ "${health_status}" == "healthy" || "${health_status}" == "running" ]]; then
        echo "${service_name} is ready (${health_status})."
        return 0
      fi
    fi

    sleep 5
    elapsed=$((elapsed + 5))
  done

  echo "Timed out waiting for ${service_name} to become ready."
  docker compose "${COMPOSE_ARGS[@]}" logs "${service_name}" || true
  exit 1
}

echo "Resetting previous deployment state and database volume..."
docker compose "${COMPOSE_ARGS[@]}" down -v --remove-orphans || true

echo "Starting fresh deployment..."
docker compose "${COMPOSE_ARGS[@]}" up -d --build

wait_for_service_health postgres
wait_for_service_health backend

echo "Seeding demo data..."
docker compose "${COMPOSE_ARGS[@]}" exec -T backend npm run prisma:seed

ln -sfn "${RELEASE_DIR}" "${APP_ROOT}/current"
rm -f "${ARCHIVE_PATH}"

find "${RELEASE_ROOT}" -mindepth 1 -maxdepth 1 -type d | sort | head -n -5 | xargs -r rm -rf

echo "Deployment completed for release ${RELEASE_ID}"

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

docker compose --env-file .env.ec2 -f docker/compose.ec2.yml up -d --build

ln -sfn "${RELEASE_DIR}" "${APP_ROOT}/current"
rm -f "${ARCHIVE_PATH}"

find "${RELEASE_ROOT}" -mindepth 1 -maxdepth 1 -type d | sort | head -n -5 | xargs -r rm -rf

echo "Deployment completed for release ${RELEASE_ID}"

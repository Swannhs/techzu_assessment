#!/usr/bin/env bash

set -euo pipefail

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This installer is intended for Ubuntu or Debian-based systems."
  exit 1
fi

echo "Installing Docker Engine and Docker Compose plugin..."

sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker "$USER"

echo
echo "Docker installation complete."
echo "Run the following to verify:"
echo "  docker --version"
echo "  docker compose version"
echo
echo "If this is your first time being added to the docker group, log out and back in before using Docker without sudo."

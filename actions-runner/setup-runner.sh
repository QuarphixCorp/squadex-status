#!/usr/bin/env bash
set -euo pipefail

# setup-runner.sh
# Download and configure a GitHub Actions self-hosted runner on Linux or macOS.
# Usage: ./setup-runner.sh [repo_url] [version]

REPO_URL=${1:-"https://github.com/QuarphixCorp/squadex-status"}
VERSION=${2:-"2.329.0"}
ZIP_NAME="actions-runner-linux-x64-${VERSION}.tar.gz"
DOWNLOAD_URL="https://github.com/actions/runner/releases/download/v${VERSION}/${ZIP_NAME}"

echo "Downloading runner ${VERSION} from ${DOWNLOAD_URL} ..."
curl -sSL -o "${ZIP_NAME}" "${DOWNLOAD_URL}"

echo "Extracting ${ZIP_NAME} ..."
tar -xzf "${ZIP_NAME}"

read -r -p "Enter the registration token (will not be stored): " -s TOKEN
echo

if [ ! -f ./config.sh ]; then
  echo "config.sh not found in current directory after extraction." >&2
  exit 1
fi

echo "Configuring runner for ${REPO_URL} ..."
./config.sh --url "${REPO_URL}" --token "${TOKEN}" --labels "self-hosted,linux,x64" --unattended

echo
echo "Runner configured. To run interactively: ./run.sh"
echo "To install as a service: sudo ./svc.sh install && sudo ./svc.sh start"

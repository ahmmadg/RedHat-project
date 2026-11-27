#!/bin/bash
# Build and push TrackFlow images to Docker Hub

set -euo pipefail
export MSYS_NO_PATHCONV=1

DOCKERHUB_USER="${DOCKERHUB_USER:-rawanashraf}"
TAG="${TAG:-v1}"
PLATFORM="${PLATFORM:-linux/amd64}"

command -v podman >/dev/null 2>&1 || {
    echo "Podman not found" >&2
    exit 1
}

echo "Logging in to Docker Hub..."
podman login docker.io

for svc in database backend frontend; do
    remote="docker.io/$DOCKERHUB_USER/trackflow-$svc"

    echo "Building trackflow-$svc..."
    podman build \
        --platform "$PLATFORM" \
        -t "$remote:$TAG" \
        "./$svc"

    echo "Pushing $remote:$TAG..."
    podman push "$remote:$TAG"
done

echo
echo "All images pushed:"
echo "docker.io/$DOCKERHUB_USER/trackflow-database:$TAG"
echo "docker.io/$DOCKERHUB_USER/trackflow-backend:$TAG"
echo "docker.io/$DOCKERHUB_USER/trackflow-frontend:$TAG"

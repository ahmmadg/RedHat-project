#!/bin/bash
set -e

# Prevent Git Bash from converting Linux paths
export MSYS_NO_PATHCONV=1

echo "Checking required secrets..."

podman secret inspect db_password >/dev/null
podman secret inspect jwt_secret >/dev/null

echo "Creating network and volume if needed..."

podman network exists trackflow-net || podman network create trackflow-net
podman volume exists pgdata || podman volume create pgdata

echo "Pulling images from Docker Hub..."

podman pull docker.io/rawanashraf/trackflow-database:v1
podman pull docker.io/rawanashraf/trackflow-backend:v1
podman pull docker.io/rawanashraf/trackflow-frontend:v1

echo "Removing old containers if they exist..."

podman rm -f trackflow-frontend trackflow-backend trackflow-db 2>/dev/null || true

echo "Starting database..."

podman run -d \
  --name trackflow-db \
  --network trackflow-net \
  -p 127.0.0.1:5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  -e POSTGRES_USER=trackflow \
  -e POSTGRES_DB=trackflow \
  -e POSTGRES_PASSWORD_FILE=/run/secrets/db_password \
  --secret db_password \
  docker.io/rawanashraf/trackflow-database:v1

echo "Waiting for database..."

for attempt in {1..30}; do
  if podman exec trackflow-db pg_isready -U trackflow -d trackflow >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

podman exec trackflow-db pg_isready -U trackflow -d trackflow

echo "Starting backend..."

podman run -d \
  --name trackflow-backend \
  --network trackflow-net \
  -p 127.0.0.1:4000:4000 \
  -e PORT=4000 \
  --secret db_password \
  --secret jwt_secret \
  docker.io/rawanashraf/trackflow-backend:v1 \
  sh -c 'export DATABASE_URL="postgresql://trackflow:$(cat /run/secrets/db_password)@trackflow-db:5432/trackflow?schema=public"; exec node src/server.js'

echo "Starting frontend..."

podman run -d \
  --name trackflow-frontend \
  --network trackflow-net \
  -p 127.0.0.1:5173:80 \
  docker.io/rawanashraf/trackflow-frontend:v1

echo "Deployment completed successfully!"
echo "Frontend: http://localhost:5173"

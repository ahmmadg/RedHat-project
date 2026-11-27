# Podman Secrets Documentation

This project uses **Podman Secrets** to avoid hard-coding sensitive credentials (such as DB passwords and JWT signing keys) in plain text or `.env` files.

---

## 1. Create the Secrets on Host

Run the following commands in your terminal to create the Podman secrets:

```bash
# Create JWT Secret
echo -n "YOUR_JWT_SECRET_HERE" | podman secret create jwt_secret -

# Create Database Password Secret (for PostgreSQL container)
echo -n "YOUR_DB_PASSWORD_HERE" | podman secret create db_password -
```

---

## 2. Verify Secrets Exist

To list all registered secrets on your host machine:

```bash
podman secret ls
```

---

## 3. How the Backend Container Consumes the Secret

The secret is mounted into the container at runtime as a read-only file at `/run/secrets/jwt_secret`:

### Manual Run (Approach 1):
```bash
podman run -d \
  --name backend \
  --network trackflow-net \
  --secret jwt_secret,type=mount,target=/run/secrets/jwt_secret \
  -e DATABASE_URL="postgresql://trackflow:YOUR_DB_PASSWORD_HERE@database:5432/trackflow?schema=public"
  -p 4000:4000 \
  trackflow-backend
```

### Compose Run (Approach 2):
In `compose.yaml`:
```yaml
services:
  backend:
    image: trackflow-backend
    ports:
      - "4000:4000"
    secrets:
      - jwt_secret

secrets:
  jwt_secret:
    external: true
```

# Podman Secrets Documentation

This project uses **Podman Secrets** to avoid hard-coding sensitive credentials (such as DB passwords and JWT signing keys) in plain text or `.env` files.

---

## 1. Create the Secrets on Host

Run the following commands in your terminal to create the Podman secrets:

```bash
# Create JWT Secret
echo -n "10778be972f7153634da039ab60f84a22789bf72e350ade64b83a0924895e713" | podman secret create jwt_secret -

# Create Database Password Secret (for PostgreSQL container)
echo -n "trackflow_secure_pass_2026" | podman secret create db_password -
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
  -e DATABASE_URL="postgresql://trackflow:trackflow_secure_pass_2026@database:5432/trackflow_db" \
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

# TrackFlow Database Container

PostgreSQL 16 container image (`docker.io/library/postgres:16-alpine`) for the **TrackFlow** package tracking system. On first start against an empty data directory, it automatically initializes the Prisma-derived schema (`/docker-entrypoint-initdb.d/01-schema.sql`) and seeds demo accounts (`/docker-entrypoint-initdb.d/02-seed.sql`).

> **Security & Non-Root Execution:** No database password is baked into the image, `Containerfile`, SQL files, or repository. The password is provided at runtime via a Podman secret (`POSTGRES_PASSWORD_FILE=/run/secrets/db_password`). The `postgres:16-alpine` entrypoint drops root privileges and runs the PostgreSQL server as the non-root `postgres` user.

---

## Connection Details

| Setting  | Value       |
| -------- | ----------- |
| Host     | `database` (on `trackflow-net`) |
| Port     | `5432`      |
| Database | `trackflow` |
| User     | `trackflow` |

---

## 1. Build the Image

```bash
podman build -t trackflow-database ./database
```

---

## 2. Create the Podman Secret

Create the `db_password` secret on your host (replace `<your-db-password>` with a strong password):

```bash
printf '%s' '<your-db-password>' | podman secret create db_password -
podman secret ls
```

---

## 3. Create the Network and Volume

```bash
podman network create trackflow-net
podman volume create pgdata
podman volume ls
podman volume inspect pgdata
```

> **Important:** init scripts only run on an empty volume; run `podman volume rm pgdata` after changing `schema.sql`.

---

## 4. Run the Container

```bash
podman run -d --name database --network trackflow-net \
  -v pgdata:/var/lib/postgresql/data \
  --secret db_password \
  -e POSTGRES_PASSWORD_FILE=/run/secrets/db_password \
  trackflow-database
```

Verify it is ready and seeded:

```bash
podman exec database pg_isready -U trackflow -d trackflow
podman exec database psql -U trackflow -d trackflow -c '\dt'
podman exec database psql -U trackflow -d trackflow -c 'SELECT email, role FROM "User";'
```

---

## 5. Volume Persistence Demo

Prove that data in `pgdata` survives container deletion:

```bash
# 1. Write scratch data
podman exec database psql -U trackflow -d trackflow -c "CREATE TABLE persist_test(id serial, note text); INSERT INTO persist_test(note) VALUES ('survives container deletion');"
podman exec database psql -U trackflow -d trackflow -c "SELECT * FROM persist_test;"

# 2. Destroy the container
podman rm -f database
podman ps -a --filter name=database

# 3. Recreate with the same pgdata volume
podman run -d --name database --network trackflow-net \
  -v pgdata:/var/lib/postgresql/data \
  --secret db_password \
  -e POSTGRES_PASSWORD_FILE=/run/secrets/db_password \
  trackflow-database

# 4. Verify data is still present
podman exec database psql -U trackflow -d trackflow -c "SELECT * FROM persist_test;"

# 5. Clean up scratch table
podman exec database psql -U trackflow -d trackflow -c "DROP TABLE persist_test;"
```

---

## 6. Demo Seed Accounts

The following demo accounts are seeded into `"User"` on first initialization (stored as `bcrypt` hashes with 12 salt rounds):

| Role      | Email                     | Password     |
| --------- | ------------------------- | ------------ |
| `ADMIN`   | `admin@trackflow.local`   | `Admin123!`  |
| `COURIER` | `courier@trackflow.local` | `Courier123!`|
| `USER`    | `user@trackflow.local`    | `User123!`   |

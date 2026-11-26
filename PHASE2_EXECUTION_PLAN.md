# Phase 2: Podman Containerization — Execution Plan & Dependency Matrix

**Project:** TrackFlow — Package Tracking System  
**Framework:** Red Hat Podman Containerization  
**Team Lead:** Moneer (Member 2)  
**Target:** 100/100 Points on Evaluation Rubric  

---

## 1. Project Overview & Deliverables
The primary objective of Phase 2 is migrating TrackFlow from bare-metal / local runtime into fully containerized environments using **Podman**, evaluated under two mandatory approaches:
1. **Approach 1 — Manual Deployment (Without Compose):** Manual orchestration via raw `podman run`, `podman network`, volumes, and secrets.
2. **Approach 2 — Automated Deployment (With Compose):** Unified multi-container orchestration using `compose.yaml`.

---

## 2. Team Role & Task Allocation

| Member | Assigned Component | Primary Deliverables | Points Owned | Difficulty |
| :--- | :--- | :--- | :---: | :---: |
| **Ahmed** (Member 3) | **Database & Persistence** | `database/Containerfile`, `database/schema.sql`, Podman Volumes | **20 pts** | ⭐ (Easy) |
| **Mostafa** (Member 1) | **Backend Core & Security** | `backend/Containerfile`, Podman Secrets, Multi-stage Node build | **15 pts** | ⭐⭐ (Medium) |
| **Moneer** (Member 2) | **Frontend & Orchestration** | `frontend/Containerfile`, `nginx.conf`, Root `compose.yaml` | **25 pts** | ⭐⭐⭐⭐ (High) |
| **Rawan** (Member 4) | **Integration & Registry** | `manual-deploy.sh`, Container Network, Docker Hub Push | **25 pts** | ⭐⭐⭐ (Medium-High) |
| **Shared** | **System Verification** | Cross-container integration & smoke testing | **15 pts** | ⭐⭐⭐ |

---

## 3. Strict Dependency Matrix (Who Waits For Whom)

Understanding the technical blockers is critical to avoid development stalls. Below is the exact dependency structure:

### 🔴 Critical Path (The Project Bottleneck)
```
Ahmed (Database) ──▶ Mostafa (Backend) ──▶ Moneer (Compose) & Rawan (Manual Run) ──▶ Registry Push
```

---

### Member Breakdown

#### 1. Ahmed (Database & Persistence)
* **Status:** **Zero Pre-requisites (Must start IMMEDIATELY).**
* **Blocked by:** No one.
* **Blocks:** **Mostafa, Rawan, Moneer.**
* **Team Lead Note:** *Ahmed is the critical foundation. The backend cannot execute queries or Prisma migrations without the database container up. Any delay by Ahmed halts the entire integration phase.*

#### 2. Mostafa (Backend Core & Security)
* **Status:** **Can author file immediately; blocked during runtime verification.**
* **Blocked by:**
  * Requires **Ahmed's** database container running on the network to verify that Prisma connects and seeds properly.
* **Blocks:** **Moneer** and **Rawan** (they cannot orchestrate or test without a functional backend image).

#### 3. Moneer (Frontend & Compose Orchestrator)
* **Status:** **Partially Independent.**
* **Independent Task:** Can write `frontend/Containerfile` (Vite build + Nginx reverse proxy) immediately.
* **Blocked by:** Requires finalized port mappings, environment variable names, and container service names from **Mostafa** and **Ahmed** to write and test the unified `compose.yaml`.

#### 4. Rawan (Integration, Manual Run & Docker Hub Registry)
* **Status:** **Dependent on all upstream services.**
* **Blocked by:**
  * Cannot write/verify `manual-deploy.sh` until all 3 `Containerfile`s (Ahmed, Mostafa, Moneer) build cleanly.
  * Cannot push final images to Docker Hub until all three images pass end-to-end integration tests.
* **Preparation Tasks (Day 1–2):** Sets up Docker Hub repository namespaces, drafts network creation commands, and creates execution scripts.

---

## 4. Phased Sprint Roadmap (6 Days)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Day 1–2: Parallel Authoring (Zero Blockers)                                │
│   • Ahmed: database/Containerfile + schema.sql                              │
│   • Mostafa: backend/Containerfile (multi-stage + prisma)                   │
│   • Moneer: frontend/Containerfile + nginx.conf                             │
│   • Rawan: Setup Docker Hub accounts & draft shell scripts                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Day 3: Foundation Integration (DB ◀──▶ Backend)                             │
│   • Ahmed delivers DB container with persistent volume                      │
│   • Mostafa connects backend container to DB via podman network             │
│   • Mostafa injects Podman Secrets (JWT secret, DB password)               │
├─────────────────────────────────────────────────────────────────────────────┤
│ Day 4–5: Full Orchestration (Both Approaches)                               │
│   • Moneer integrates all 3 services into root compose.yaml (Approach 2)   │
│   • Rawan writes manual step-by-step commands in manual-deploy.sh (Appr. 1) │
├─────────────────────────────────────────────────────────────────────────────┤
│ Day 6: Registry Push & Final Verification                                   │
│   • Rawan builds, tags, and pushes images to Docker Hub                     │
│   • Full team performs smoke testing (Customer, Courier, Admin flows)       │
│   • Submission packaging: Text file with repo link                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Standardized Environment Configuration

To prevent configuration mismatches between containers, the team must adhere strictly to these shared parameters:

* **Podman Network Name:** `trackflow-net`
* **Volume Name:** `pgdata` (mounted to `/var/lib/postgresql/data`)
* **Ports:**
  * Database: `5432:5432` (Internal only / exposed for debug)
  * Backend API: `4000:4000`
  * Frontend: `80:80` (or `5173:80` external mapping)
* **Container Names:**
  * `trackflow-db`
  * `trackflow-backend`
  * `trackflow-frontend`

---

## 6. Target Repository Structure

```
RedHat-project/
├── backend/
│   ├── Containerfile             # Maintained by Mostafa
│   ├── package.json
│   └── src/
├── frontend/
│   ├── Containerfile             # Maintained by Moneer
│   ├── nginx.conf                # Nginx proxy config
│   ├── package.json
│   └── src/
├── database/
│   ├── Containerfile             # Maintained by Ahmed
│   └── schema.sql                # DB schema initialization
├── secrets/
│   └── README.md                 # Maintained by Mostafa (Podman Secrets guide)
├── compose.yaml                  # Maintained by Moneer (Approach 2)
├── manual-deploy.sh              # Maintained by Rawan (Approach 1)
├── push-images.sh                # Maintained by Rawan (Docker Hub Push)
└── README.md                     # Complete project documentation
```

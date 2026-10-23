## Project Structure

```text
backend/
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── domain/                         # Core business rules
│   │   ├── entities/                   # Core domain entities
│   │   ├── enums/                      # Domain enumerations
│   │   ├── errors/                     # Domain-specific errors
│   │   └── repositories/                # Repository contracts
│   │
│   ├── application/                    # Application use cases
│   │   ├── use-cases/                  # Business operations
│   │   ├── services/                   # Application services
│   │   ├── dto/                        # Data transfer objects
│   │   └── interfaces/                 # Application abstractions
│   │
│   ├── infrastructure/                 # External technology implementations
│   │   ├── database/
│   │   │   ├── prisma/                 # Prisma client and database access
│   │   │   └── repositories/            # Repository implementations
│   │   ├── auth/                       # JWT and password utilities
│   │   └── config/                     # Environment configuration
│   │
│   ├── presentation/                   # HTTP API layer
│   │   ├── routes/                     # Express route definitions
│   │   ├── controllers/                # HTTP request/response handling
│   │   ├── middleware/                 # Authentication and authorization
│   │   └── validators/                 # Request validation
│   │
│   ├── app.js                          # Express application setup
│   └── server.js                       # Server entry point
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Architecture Overview

The backend is organized around four architectural layers, separating business rules from application workflows, infrastructure concerns, and HTTP delivery.

### 1. Domain

Contains the core business concepts and rules. It should remain independent of Express, Prisma, and other external frameworks.

### 2. Application

Coordinates application use cases, such as registering users, authenticating users, creating shipments, and assigning deliveries. It depends on domain abstractions rather than infrastructure implementations.

### 3. Infrastructure

Implements technical details, including Prisma database access, repository implementations, password hashing, and JWT-related utilities.

### 4. Presentation

Exposes the application through an HTTP API using Express. Routes map endpoints, middleware handles cross-cutting HTTP concerns, and controllers invoke application use cases.

## Dependency Direction

Dependencies should point inward toward the Domain layer.

```text
Presentation ──► Application ──► Domain
Infrastructure ──► Application / Domain
```

The Domain layer does not depend on the other layers. Application code should not directly depend on Express or Prisma-specific implementations. Infrastructure implements the abstractions required by the inner layers.

## Request Flow

```text
HTTP Request
     ↓
Presentation (Express Routes & Middleware)
     ↓
Controllers
     ↓
Application Use Cases
     ↓
Domain Rules
     ↓
Repository Abstraction
     ↑
Infrastructure (Prisma Repository)
     ↓
PostgreSQL
```

The application invokes repository abstractions, while Infrastructure provides their concrete implementations using Prisma. This keeps persistence details outside the core business logic.

## Design Goals

- Separation of concerns across architectural layers.
- Business rules independent of frameworks and database technology.
- Testable application use cases.
- Replaceable infrastructure implementations.
- Centralized authentication and authorization.
- Extensible design for shipment tracking, courier operations, and administration.

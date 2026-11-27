-- Seed demo users for TrackFlow (one per role: ADMIN, COURIER, USER)
INSERT INTO "User" (
    "id",
    "fullName",
    "email",
    "phone",
    "passwordHash",
    "role",
    "createdAt",
    "updatedAt"
) VALUES
    (
        '00000000-0000-4000-8000-000000000001',
        'TrackFlow Admin',
        'admin@trackflow.local',
        '+1-555-0101',
        '$2b$12$Veu7HQ/8.6QGFpriy9.1qu.M0uH1W9U10tE5V2G.TuFmhCWcR7ypS',
        'ADMIN',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        '00000000-0000-4000-8000-000000000002',
        'TrackFlow Courier',
        'courier@trackflow.local',
        '+1-555-0102',
        '$2b$12$bUDkQKLnHpqomDJI.VzKr.ou2ziOZKKmCpoYtoFHF1wFPAKjxzaRe',
        'COURIER',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        '00000000-0000-4000-8000-000000000003',
        'TrackFlow User',
        'user@trackflow.local',
        '+1-555-0103',
        '$2b$12$oYdR32A70.tqbAUvL4XcFOLzHTTCb2dcJQyLRPrsSyvWTT/ht7dq2',
        'USER',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
ON CONFLICT DO NOTHING;

import fs from "fs";

/**
 * Retrieves a secret from Podman/Docker secrets directory (/run/secrets/),
 * or falls back to an environment variable.
 */
export function getSecret(name, envFallbackKey = name) {
  const secretPath = `/run/secrets/${name}`;
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, "utf8").trim();
  }
  return process.env[envFallbackKey];
}

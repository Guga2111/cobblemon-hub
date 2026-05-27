import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL ?? "file:./data/cobblemon.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient(
  url.startsWith("file:") ? { url } : { url, authToken }
);

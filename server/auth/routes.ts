import { Hono } from "hono";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { db } from "../db/client.ts";
import { AUTH_CONFIG } from "./config.ts";
import { requireAuth } from "./middleware.ts";

const authApp = new Hono<{ Variables: { userId: string } }>();

const registerSchema = z.object({
  email: z.string().email("Email invalido"),
  displayName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Senha obrigatoria"),
});

function generateId(): string {
  return crypto.randomUUID();
}

function createToken(userId: string): string {
  return jwt.sign({ userId }, AUTH_CONFIG.jwtSecret, {
    expiresIn: AUTH_CONFIG.jwtExpiresIn as string,
  } as jwt.SignOptions);
}

function setTokenCookie(token: string): string {
  return serialize(AUTH_CONFIG.cookieName, token, AUTH_CONFIG.cookieOptions);
}

function clearTokenCookie(): string {
  return serialize(AUTH_CONFIG.cookieName, "", {
    ...AUTH_CONFIG.cookieOptions,
    maxAge: 0,
  });
}

// POST /api/auth/register
authApp.post("/register", async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0].message }, 400);
  }

  const { email, displayName, password } = parsed.data;

  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [email],
  });

  if (existing.rows.length > 0) {
    return c.json({ error: "Email ja cadastrado" }, 409);
  }

  const id = generateId();
  const passwordHash = await bcrypt.hash(password, AUTH_CONFIG.bcryptRounds);

  await db.execute({
    sql: `INSERT INTO users (id, email, display_name, password_hash) VALUES (?, ?, ?, ?)`,
    args: [id, email, displayName, passwordHash],
  });

  const token = createToken(id);
  c.header("Set-Cookie", setTokenCookie(token));

  return c.json({
    user: { id, email, displayName },
  });
});

// POST /api/auth/login
authApp.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0].message }, 400);
  }

  const { email, password } = parsed.data;

  const result = await db.execute({
    sql: "SELECT id, email, display_name, password_hash FROM users WHERE email = ?",
    args: [email],
  });

  if (result.rows.length === 0) {
    return c.json({ error: "Email ou senha incorretos" }, 401);
  }

  const row = result.rows[0] as Record<string, unknown>;
  const valid = await bcrypt.compare(password, row.password_hash as string);

  if (!valid) {
    return c.json({ error: "Email ou senha incorretos" }, 401);
  }

  const token = createToken(row.id as string);
  c.header("Set-Cookie", setTokenCookie(token));

  return c.json({
    user: {
      id: row.id as string,
      email: row.email as string,
      displayName: row.display_name as string,
    },
  });
});

// GET /api/auth/me
authApp.get("/me", requireAuth, async (c) => {
  const userId = c.get("userId");

  const result = await db.execute({
    sql: "SELECT id, email, display_name FROM users WHERE id = ?",
    args: [userId],
  });

  if (result.rows.length === 0) {
    return c.json({ error: "Usuario nao encontrado" }, 404);
  }

  const row = result.rows[0] as Record<string, unknown>;
  return c.json({
    user: {
      id: row.id as string,
      email: row.email as string,
      displayName: row.display_name as string,
    },
  });
});

// POST /api/auth/logout
authApp.post("/logout", (c) => {
  c.header("Set-Cookie", clearTokenCookie());
  return c.json({ ok: true });
});

export { authApp };

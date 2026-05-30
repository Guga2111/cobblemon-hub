import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { AUTH_CONFIG } from "./config.ts";

type AuthPayload = { userId: string };

export const requireAuth = createMiddleware<{
  Variables: { userId: string };
}>(async (c, next) => {
  const cookieHeader = c.req.header("cookie") ?? "";
  const cookies = parse(cookieHeader);
  const token = cookies[AUTH_CONFIG.cookieName];

  if (!token) {
    return c.json({ error: "Nao autenticado" }, 401);
  }

  try {
    const payload = jwt.verify(token, AUTH_CONFIG.jwtSecret) as AuthPayload;
    c.set("userId", payload.userId);
    await next();
  } catch {
    return c.json({ error: "Token invalido" }, 401);
  }
});

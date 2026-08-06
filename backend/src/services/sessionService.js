import { createHash, randomBytes } from "node:crypto";
import { parseCookie, stringifySetCookie } from "cookie";
import { prisma } from "../lib/prisma.js";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from "../config/constants.js";

const parse = parseCookie;

function serialize(name, value, options) {
  return stringifySetCookie({ name, value, ...options });
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export async function createSession(userId, response) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      adminUserId: userId,
      expiresAt,
    },
  });

  response.setHeader(
    "Set-Cookie",
    serialize(SESSION_COOKIE_NAME, token, cookieOptions()),
  );
}

export function clearSessionCookie(response) {
  response.setHeader(
    "Set-Cookie",
    serialize(SESSION_COOKIE_NAME, "", {
      ...cookieOptions(),
      maxAge: 0,
    }),
  );
}

export async function getAuthenticatedUser(request, response) {
  const cookies = parse(request.headers.cookie ?? "");
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { adminUser: true },
  });

  if (!session || session.expiresAt <= new Date() || !session.adminUser.isActive) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    clearSessionCookie(response);
    return null;
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    id: session.adminUser.id,
    name: session.adminUser.name,
    email: session.adminUser.email,
    role: session.adminUser.role,
  };
}

export async function destroySession(request, response) {
  const cookies = parse(request.headers.cookie ?? "");
  const token = cookies[SESSION_COOKIE_NAME];

  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  clearSessionCookie(response);
}

import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";
import {
  createSession,
  destroySession,
} from "../services/sessionService.js";

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function login(request, response, next) {
  const email = request.body?.email?.trim().toLowerCase();
  const password = request.body?.password;

  if (!email || typeof password !== "string" || password.length === 0) {
    return response.status(400).json({
      message: "E-mail e senha são obrigatórios.",
    });
  }

  try {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    const validPassword = user
      ? await argon2.verify(user.passwordHash, password)
      : false;

    if (!user || !user.isActive || !validPassword) {
      return response.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    await createSession(user.id, response);

    return response.status(200).json({
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function logout(request, response, next) {
  try {
    await destroySession(request, response);
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export function me(request, response) {
  return response.status(200).json({ user: request.user });
}

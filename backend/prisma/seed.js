import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Administrador";

if (!email || !password) {
  throw new Error("ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios para executar o seed.");
}

if (password.length < 12) {
  throw new Error("ADMIN_PASSWORD deve ter pelo menos 12 caracteres.");
}

const passwordHash = await argon2.hash(password, {
  type: argon2.argon2id,
});

await prisma.adminUser.upsert({
  where: { email },
  update: {
    name,
    passwordHash,
    isActive: true,
  },
  create: {
    name,
    email,
    passwordHash,
  },
});

console.log(`Administrador configurado: ${email}`);
await prisma.$disconnect();

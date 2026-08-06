import { prisma } from "../lib/prisma.js";

export async function createContact(request, response, next) {
  const { name, phone, message } = request.body ?? {};
  const normalizedName = name?.trim();
  const normalizedPhone = phone?.trim();
  const normalizedMessage = message?.trim();

  if (!normalizedName || !normalizedPhone || !normalizedMessage) {
    return response.status(400).json({
      message: "Nome, telefone e mensagem são obrigatórios.",
    });
  }

  if (normalizedName.length > 120) {
    return response.status(400).json({
      message: "O nome deve ter no máximo 120 caracteres.",
    });
  }

  if (normalizedPhone.length > 30) {
    return response.status(400).json({
      message: "O telefone deve ter no máximo 30 caracteres.",
    });
  }

  if (normalizedMessage.length > 2000) {
    return response.status(400).json({
      message: "A mensagem deve ter no máximo 2000 caracteres.",
    });
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        name: normalizedName,
        phone: normalizedPhone,
        message: normalizedMessage,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    return response.status(201).json({
      message: "Solicitação enviada com sucesso!",
      contact,
    });
  } catch (error) {
    return next(error);
  }
}

import { randomUUID } from "node:crypto";
import contacts from "../data/contacts.js";

export function createContact(request, response) {
  const { name, phone, message } = request.body;

  if (!name?.trim() || !phone?.trim() || !message?.trim()) {
    return response.status(400).json({
      message: "Nome, telefone e mensagem são obrigatórios.",
    });
  }

  const contact = {
    id: randomUUID(),
    name: name.trim(),
    phone: phone.trim(),
    message: message.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  contacts.push(contact);

  return response.status(201).json({
    message: "Solicitação enviada com sucesso!",
    contact,
  });
}

export function listContacts(request, response) {
  return response.status(200).json(contacts);
}
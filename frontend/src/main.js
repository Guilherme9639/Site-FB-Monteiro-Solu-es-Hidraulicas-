async function verificarApi() {
  try {
    const response = await fetch("http://localhost:3000/api/health");

    if (!response.ok) {
      throw new Error("O servidor retornou um erro.");
    }

    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error("Não foi possível conectar ao servidor:", error);
  }
}

verificarApi();

const contactForm = document.querySelector("#contact-form");
const formFeedback = document.querySelector("#form-feedback");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formData = new FormData(contactForm);
  const contact = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  formFeedback.textContent = "";

  try {
    const response = await fetch("http://localhost:3000/api/contatos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    formFeedback.textContent = data.message;
    formFeedback.style.color = "#087f5b";
    contactForm.reset();
  } catch (error) {
    formFeedback.textContent =
      error.message || "Não foi possível enviar a solicitação.";
    formFeedback.style.color = "#c92a2a";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar solicitação";
  }
});

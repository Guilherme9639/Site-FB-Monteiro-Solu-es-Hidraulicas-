const statusElement = document.querySelector("#api-status");

async function verificarApi() {
  try {
    const response = await fetch("http://localhost:3000/api/health");

    if (!response.ok) {
      throw new Error("O servidor retornou um erro.");
    }

    const data = await response.json();
    statusElement.textContent = data.message;
  } catch (error) {
    statusElement.textContent = "Não foi possível conectar ao servidor.";
    console.error(error);
  }
}

verificarApi();


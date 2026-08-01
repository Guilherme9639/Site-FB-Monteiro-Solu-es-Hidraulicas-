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


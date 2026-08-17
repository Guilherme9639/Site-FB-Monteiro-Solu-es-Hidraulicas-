const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function verificarApi() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/health`);

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

const projectCarousel = document.querySelector("#project-carousel");
let carouselTimer;

function renderProject(project) {
  if (!project || !project.images?.length) {
    projectCarousel.innerHTML =
      '<p class="carousel-status">Nenhuma obra publicada no momento.</p>';
    return;
  }

  const images = project.images;
  let currentImage = 0;
  const projectsLink = window.location.pathname.endsWith("sobre.html")
    ? "#obras"
    : "/sobre.html#obras";

  projectCarousel.innerHTML = `
    <div class="project-carousel-frame">
      <img class="project-carousel-image" src="${apiBaseUrl}${images[0].url}" alt="${images[0].description || project.title}" />
      <button class="carousel-control carousel-control-prev" type="button" aria-label="Foto anterior">&#10094;</button>
      <button class="carousel-control carousel-control-next" type="button" aria-label="Próxima foto">&#10095;</button>
      <div class="carousel-indicators" role="tablist" aria-label="Fotos da obra"></div>
    </div>
    <div class="project-carousel-details">
      <h3>${project.title}</h3>
      <p>${project.description || "Confira os detalhes desta obra."}</p>
      <a class="secondary-button project-more-link" href="${projectsLink}">Ver mais trabalhos</a>
    </div>
  `;

  const imageElement = projectCarousel.querySelector(".project-carousel-image");
  const indicators = projectCarousel.querySelector(".carousel-indicators");

  function showImage(index) {
    currentImage = (index + images.length) % images.length;
    const image = images[currentImage];
    imageElement.src = `${apiBaseUrl}${image.url}`;
    imageElement.alt = image.description || project.title;
    indicators.querySelectorAll("button").forEach((button, buttonIndex) => {
      button.classList.toggle("is-active", buttonIndex === currentImage);
      button.setAttribute("aria-selected", String(buttonIndex === currentImage));
    });
  }

  images.forEach((image, index) => {
    const indicator = document.createElement("button");
    indicator.type = "button";
    indicator.className = "carousel-indicator";
    indicator.setAttribute("role", "tab");
    indicator.setAttribute("aria-label", `Exibir foto ${index + 1}`);
    indicator.addEventListener("click", () => {
      showImage(index);
      restartCarouselTimer();
    });
    indicators.append(indicator);
  });

  projectCarousel.querySelector(".carousel-control-prev").addEventListener("click", () => {
    showImage(currentImage - 1);
    restartCarouselTimer();
  });
  projectCarousel.querySelector(".carousel-control-next").addEventListener("click", () => {
    showImage(currentImage + 1);
    restartCarouselTimer();
  });

  function restartCarouselTimer() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => showImage(currentImage + 1), 5000);
  }

  showImage(0);
  restartCarouselTimer();
}

async function carregarObra() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/projects`);
    if (!response.ok) throw new Error("Não foi possível carregar as obras.");
    const data = await response.json();
    renderProject(data.projects?.[0]);
  } catch (error) {
    projectCarousel.innerHTML =
      '<p class="carousel-status">Não foi possível carregar a obra agora.</p>';
    console.error(error);
  }
}

carregarObra();

const contactForm = document.querySelector("#contact-form");
const formFeedback = document.querySelector("#form-feedback");

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formData = new FormData(contactForm);
  const contact = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  formFeedback.textContent = "";

  try {
    const response = await fetch(`${apiBaseUrl}/api/contatos`, {
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

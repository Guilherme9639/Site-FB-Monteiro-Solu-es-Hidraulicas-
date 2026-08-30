const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const fallbackPhotos = [
  { src: "/images/obras/ricam/capa.jpeg", label: "Capa da obra" },
  { src: "/images/obras/ricam/01.jpeg", label: "Instalação hidráulica" },
  { src: "/images/obras/ricam/02.jpeg", label: "Execução da obra" },
  { src: "/images/obras/ricam/03.jpeg", label: "Detalhe da instalação" },
];

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
}[character]));

function mediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/api/")) return `${apiBaseUrl}${url}`;
  return url.startsWith("/") ? url : `/${url}`;
}

function normalizeImages(carousel) {
  if (!carousel?.images?.length) return fallbackPhotos;
  return carousel.images.map((image) => ({
    src: mediaUrl(image.url),
    label: image.description || carousel.project?.title || "Imagem da obra",
  }));
}

function renderWorks(images) {
  const strip = document.querySelector("#works-strip");
  if (!strip) return;
  strip.replaceChildren(...images.slice(1).map((image) => {
    const element = document.createElement("img");
    element.src = image.src;
    element.alt = image.label;
    return element;
  }));
}

function renderProjectCarousel(carousel) {
  const target = document.querySelector("#project-carousel");
  if (!target) return;
  const images = normalizeImages(carousel);
  const projectTitle = carousel?.project?.title || "Obra em destaque";
  let activePhoto = 0;

  target.innerHTML = `
    <div class="carousel-image-wrap">
      <img class="carousel-image" src="${images[0].src}" alt="${escapeHtml(images[0].label)}" />
      <span class="carousel-counter">01 / ${String(images.length).padStart(2, "0")}</span>
      <button class="carousel-arrow carousel-arrow-left" type="button" aria-label="Foto anterior">←</button>
      <button class="carousel-arrow carousel-arrow-right" type="button" aria-label="Próxima foto">→</button>
    </div>
    <div class="carousel-caption"><div><p class="eyebrow">Obra em destaque</p><h2>${escapeHtml(projectTitle)}</h2></div><a href="/sobre.html#obras">Ver mais trabalhos <span>↗</span></a></div>
    <div class="carousel-dots" role="tablist" aria-label="Selecionar foto"></div>
  `;

  const imageElement = target.querySelector(".carousel-image");
  const counter = target.querySelector(".carousel-counter");
  const dots = target.querySelector(".carousel-dots");
  let timer;

  function showPhoto(index) {
    activePhoto = (index + images.length) % images.length;
    const photo = images[activePhoto];
    imageElement.src = photo.src;
    imageElement.alt = photo.label;
    counter.textContent = `${String(activePhoto + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
    dots.querySelectorAll("button").forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activePhoto);
      dot.setAttribute("aria-selected", String(dotIndex === activePhoto));
    });
  }

  function restartTimer() {
    window.clearInterval(timer);
    timer = window.setInterval(() => showPhoto(activePhoto + 1), 5000);
  }

  images.forEach((photo, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Exibir ${photo.label}`);
    dot.addEventListener("click", () => { showPhoto(index); restartTimer(); });
    dots.append(dot);
  });
  target.querySelector(".carousel-arrow-left").addEventListener("click", () => { showPhoto(activePhoto - 1); restartTimer(); });
  target.querySelector(".carousel-arrow-right").addEventListener("click", () => { showPhoto(activePhoto + 1); restartTimer(); });
  showPhoto(0);
  restartTimer();
}

async function loadWorkCarousel() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/work-carousel`);
    if (!response.ok) throw new Error("Não foi possível carregar a obra.");
    const data = await response.json();
    const images = normalizeImages(data);
    renderProjectCarousel(data);
    renderWorks(images);
  } catch (error) {
    renderProjectCarousel(null);
    renderWorks(fallbackPhotos);
    console.warn("Usando imagens locais enquanto a API não está disponível.", error);
  }
}

loadWorkCarousel();

const contactForm = document.querySelector("#contact-form");
const formFeedback = document.querySelector("#form-feedback");

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  formFeedback.textContent = "";
  formFeedback.className = "form-feedback";
  try {
    const response = await fetch(`${apiBaseUrl}/api/contatos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(contactForm).entries())),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Não foi possível enviar a solicitação.");
    formFeedback.textContent = data.message || "Solicitação enviada com sucesso.";
    formFeedback.classList.add("success");
    contactForm.reset();
  } catch (error) {
    formFeedback.textContent = error.message || "Não foi possível enviar a solicitação.";
    formFeedback.classList.add("error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar solicitação";
  }
});

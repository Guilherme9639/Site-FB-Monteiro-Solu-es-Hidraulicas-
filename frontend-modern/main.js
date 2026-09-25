const photos = [
  { src: "./images/obras/ricam/01.jpeg", title: "Instalação hidráulica", alt: "Tubulações hidráulicas em obra" },
  { src: "./images/obras/ricam/02.jpeg", title: "Execução da obra", alt: "Execução de instalação hidráulica" },
  { src: "./images/obras/ricam/03.jpeg", title: "Detalhe da instalação", alt: "Detalhe de uma instalação hidráulica" },
];

const image = document.querySelector("#work-image");
const counter = document.querySelector("#work-counter");
const title = document.querySelector("#work-title");
const dots = [...document.querySelectorAll(".works-dots button")];
let active = 0;
let timer;

function showPhoto(index) {
  active = (index + photos.length) % photos.length;
  const photo = photos[active];
  image.src = photo.src;
  image.alt = photo.alt;
  title.textContent = photo.title;
  counter.textContent = `${String(active + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
  dots.forEach((dot, dotIndex) => {
    const selected = dotIndex === active;
    dot.classList.toggle("is-active", selected);
    dot.setAttribute("aria-selected", String(selected));
  });
}

function restartTimer() {
  window.clearInterval(timer);
  timer = window.setInterval(() => showPhoto(active + 1), 5000);
}

document.querySelector("#work-prev")?.addEventListener("click", () => { showPhoto(active - 1); restartTimer(); });
document.querySelector("#work-next")?.addEventListener("click", () => { showPhoto(active + 1); restartTimer(); });
dots.forEach((dot, index) => dot.addEventListener("click", () => { showPhoto(index); restartTimer(); }));
document.querySelector(".works-main")?.addEventListener("mouseenter", () => window.clearInterval(timer));
document.querySelector(".works-main")?.addEventListener("mouseleave", restartTimer);
showPhoto(0);
restartTimer();

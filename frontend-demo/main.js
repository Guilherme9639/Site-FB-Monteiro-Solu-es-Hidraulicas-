const photos = [
  { src: "./images/obra-01.svg", title: "Instalação hidráulica", alt: "Ilustração de tubulações hidráulicas" },
  { src: "./images/obra-02.svg", title: "Execução da obra", alt: "Ilustração de execução de instalação hidráulica" },
  { src: "./images/obra-03.svg", title: "Detalhe da instalação", alt: "Ilustração de detalhe hidráulico" },
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

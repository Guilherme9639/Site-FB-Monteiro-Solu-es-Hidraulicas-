const API_BASE = "http://localhost:3000";

const loginView = document.querySelector("#login-view");
const dashboardView = document.querySelector("#dashboard-view");
const loginForm = document.querySelector("#login-form");
const loginFeedback = document.querySelector("#login-feedback");
const currentUser = document.querySelector("#current-user");
const projectForm = document.querySelector("#project-form");
const projectFeedback = document.querySelector("#project-feedback");
const projectsFeedback = document.querySelector("#projects-feedback");
const projectsList = document.querySelector("#projects-list");
const siteImagesList = document.querySelector("#site-images-list");
const siteImagesFeedback = document.querySelector("#site-images-feedback");
const workCarouselCustomView = document.querySelector("#work-carousel-custom-view");
const workCarouselProjectView = document.querySelector("#work-carousel-project-view");
const workCarouselImagesList = document.querySelector("#work-carousel-images-list");
const workCarouselFileInput = document.querySelector("#work-carousel-file-input");
const workCarouselCustomFeedback = document.querySelector("#work-carousel-custom-feedback");
const workCarouselSelectedProject = document.querySelector("#work-carousel-selected-project");
const workCarouselProjectFeedback = document.querySelector("#work-carousel-project-feedback");
const workCarouselModeFeedback = document.querySelector("#work-carousel-mode-feedback");
const workCarouselFeedback = document.querySelector("#work-carousel-feedback");
const projectSelectorModal = document.querySelector("#project-selector-modal");
const projectSelectorList = document.querySelector("#project-selector-list");
const projectSelectorFeedback = document.querySelector("#project-selector-feedback");
const projectSelectorSaveButton = document.querySelector("#save-project-selection");
let projectsCache = [];
let workCarouselConfig = null;
let selectedProjectDraftId = null;
let workCarouselUploadInProgress = false;
const SITE_IMAGE_SECTIONS = {
  "home.hero": {
    title: "Banner principal da página inicial",
    location:
      "Posição reservada para o topo da página inicial. O frontend público ainda não consome esta chave.",
  },
  "sobre.empresa": {
    title: "Imagem institucional da empresa",
    location:
      "Posição reservada para a seção Sobre. O frontend público ainda não consome esta chave.",
  },
  "contato.banner": {
    title: "Banner da área de contato",
    location:
      "Posição reservada para a área de contato. O frontend público ainda não consome esta chave.",
  },
};
const SITE_IMAGE_KEYS = Object.keys(SITE_IMAGE_SECTIONS);

function setFeedback(element, message, type = "") {
  element.textContent = message;
  element.className = `feedback ${type}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
  });
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Não foi possível concluir a solicitação.");
  }

  return data;
}

function createElement(tag, properties = {}, children = []) {
  const element = document.createElement(tag);

  for (const [property, value] of Object.entries(properties)) {
    if (property === "className") {
      element.className = value;
    } else if (property === "textContent") {
      element.textContent = value;
    } else if (property.startsWith("on")) {
      element.addEventListener(property.slice(2).toLowerCase(), value);
    } else {
      element[property] = value;
    }
  }

  for (const child of children) {
    element.append(child);
  }

  return element;
}

function showDashboard(user) {
  loginView.hidden = true;
  dashboardView.hidden = false;
  currentUser.textContent = `${user.name} · ${user.email}`;
}

function showLogin() {
  dashboardView.hidden = true;
  loginView.hidden = false;
}

function formatDate(value) {
  if (!value) return "Data não disponível";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não disponível";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function createProjectCard(project) {
  const title = createElement("h3", { textContent: project.title });
  const meta = createElement("p", {
    className: "project-meta",
    textContent: `Slug: ${project.slug} · ${project.images.length} imagem(ns)`,
  });
  const badge = createElement("span", {
    className: `visibility-badge${project.isVisible ? "" : " hidden-badge"}`,
    textContent: project.isVisible ? "Visível" : "Oculto",
  });
  const header = createElement("div", { className: "project-header" }, [
    createElement("div", {}, [title, meta]),
    badge,
  ]);

  const description = createElement("p", {
    className: "project-description",
    textContent: project.description || "Sem descrição.",
  });

  const titleInput = createElement("input", {
    type: "text",
    value: project.title,
    minLength: 3,
    maxLength: 160,
  });
  const descriptionInput = createElement("textarea", {
    rows: 3,
    value: project.description || "",
    maxLength: 5000,
  });
  const saveProjectButton = createElement("button", {
    type: "button",
    className: "secondary-button",
    textContent: "Salvar alterações",
    onclick: async () => {
      try {
        await request(`/api/admin/projects/${project.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: titleInput.value,
            description: descriptionInput.value,
          }),
        });
        await loadProjects();
      } catch (error) {
        setFeedback(projectsFeedback, error.message, "error");
      }
    },
  });
  const editForm = createElement("div", { className: "stack-form" }, [
    createElement("label", { textContent: "Título" }, [titleInput]),
    createElement("label", { textContent: "Descrição" }, [descriptionInput]),
    saveProjectButton,
  ]);

  const visibilityButton = createElement("button", {
    className: "secondary-button",
    type: "button",
    textContent: project.isVisible ? "Ocultar" : "Publicar",
    onclick: async () => {
      try {
        await request(`/api/admin/projects/${project.id}/visibility`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ isVisible: !project.isVisible }),
        });
        await loadProjects();
      } catch (error) {
        setFeedback(projectsFeedback, error.message, "error");
      }
    },
  });

  const deleteButton = createElement("button", {
    className: "danger-button",
    type: "button",
    textContent: "Excluir definitivamente",
    onclick: async () => {
      if (!window.confirm(`Excluir definitivamente “${project.title}”?`)) return;

      try {
        await request(`/api/admin/projects/${project.id}`, { method: "DELETE" });
        await loadProjects();
      } catch (error) {
        setFeedback(projectsFeedback, error.message, "error");
      }
    },
  });

  const actions = createElement("div", { className: "project-actions" }, [
    visibilityButton,
    deleteButton,
  ]);

  const fileInput = createElement("input", {
    type: "file",
    accept: "image/jpeg,image/png",
    multiple: true,
  });
  const uploadButton = createElement("button", {
    type: "button",
    textContent: "Adicionar imagens",
    onclick: async () => {
      if (!fileInput.files.length) return;
      const formData = new FormData();
      for (const file of fileInput.files) formData.append("images", file);

      try {
        await request(`/api/admin/projects/${project.id}/images`, {
          method: "POST",
          body: formData,
        });
        fileInput.value = "";
        await loadProjects();
      } catch (error) {
        setFeedback(projectsFeedback, error.message, "error");
      }
    },
  });
  const imageUpload = createElement("div", { className: "image-upload" }, [
    createElement("strong", { textContent: "Galeria" }),
    fileInput,
    uploadButton,
  ]);

  const imageList = createElement("div", { className: "image-list" });
  for (const image of project.images) {
    const imageElement = createElement("img", {
      src: `${API_BASE}${image.url}`,
      alt: image.description || project.title,
    });
    const descriptionInput = createElement("input", {
      type: "text",
      value: image.description || "",
      placeholder: "Descrição da imagem",
      maxLength: 2000,
    });
    const saveDescription = createElement("button", {
      type: "button",
      className: "secondary-button",
      textContent: "Salvar descrição",
      onclick: async () => {
        try {
          await request(`/api/admin/projects/images/${image.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ description: descriptionInput.value }),
          });
          await loadProjects();
        } catch (error) {
          setFeedback(projectsFeedback, error.message, "error");
        }
      },
    });
    const coverButton = createElement("button", {
      type: "button",
      className: "secondary-button",
      textContent: image.isCover ? "Capa selecionada" : "Usar como capa",
      onclick: async () => {
        try {
          await request(`/api/admin/projects/images/${image.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ isCover: true }),
          });
          await loadProjects();
        } catch (error) {
          setFeedback(projectsFeedback, error.message, "error");
        }
      },
    });
    const deleteImage = createElement("button", {
      type: "button",
      className: "danger-button",
      textContent: "Remover",
      onclick: async () => {
        try {
          await request(`/api/admin/projects/images/${image.id}`, { method: "DELETE" });
          await loadProjects();
        } catch (error) {
          setFeedback(projectsFeedback, error.message, "error");
        }
      },
    });
    const moveUpButton = createElement("button", {
      type: "button",
      className: "secondary-button",
      textContent: "Subir",
      disabled: image.displayOrder === 0,
      onclick: async () => {
        const orderedIds = project.images
          .slice()
          .sort((left, right) => left.displayOrder - right.displayOrder)
          .map((item) => item.id);
        const index = orderedIds.indexOf(image.id);
        if (index <= 0) return;
        [orderedIds[index - 1], orderedIds[index]] = [orderedIds[index], orderedIds[index - 1]];
        try {
          await request(`/api/admin/projects/${project.id}/images/order`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ imageIds: orderedIds }),
          });
          await loadProjects();
        } catch (error) {
          setFeedback(projectsFeedback, error.message, "error");
        }
      },
    });
    const moveDownButton = createElement("button", {
      type: "button",
      className: "secondary-button",
      textContent: "Descer",
      disabled: image.displayOrder === project.images.length - 1,
      onclick: async () => {
        const orderedIds = project.images
          .slice()
          .sort((left, right) => left.displayOrder - right.displayOrder)
          .map((item) => item.id);
        const index = orderedIds.indexOf(image.id);
        if (index < 0 || index >= orderedIds.length - 1) return;
        [orderedIds[index], orderedIds[index + 1]] = [orderedIds[index + 1], orderedIds[index]];
        try {
          await request(`/api/admin/projects/${project.id}/images/order`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ imageIds: orderedIds }),
          });
          await loadProjects();
        } catch (error) {
          setFeedback(projectsFeedback, error.message, "error");
        }
      },
    });
    imageList.append(
      createElement("article", { className: "image-card" }, [
        imageElement,
        createElement("small", {
          textContent: image.isCover ? "Imagem de capa" : `Ordem ${image.displayOrder + 1}`,
        }),
        descriptionInput,
        createElement("div", { className: "image-actions" }, [
          saveDescription,
          coverButton,
          moveUpButton,
          moveDownButton,
          deleteImage,
        ]),
      ]),
    );
  }

  return createElement("article", { className: "project-card" }, [
    header,
    description,
    editForm,
    actions,
    imageUpload,
    imageList,
  ]);
}

function createSiteImageCard(key, image) {
  const section = SITE_IMAGE_SECTIONS[key];
  const fileInputId = `site-image-file-${key.replace(/[^a-z0-9]+/gi, "-")}`;
  const fileInput = createElement("input", {
    id: fileInputId,
    className: "site-image-file-input",
    type: "file",
    accept: "image/jpeg,image/png",
  });
  const selectedFile = createElement("span", {
    className: "selected-file",
    textContent: "Nenhum novo arquivo selecionado.",
  });
  const descriptionInput = createElement("input", {
    type: "text",
    value: image?.description || "",
    placeholder: "Descrição acessível da imagem",
    maxLength: 2000,
  });
  const feedback = createElement("p", {
    className: "feedback site-image-card-feedback",
  });
  feedback.setAttribute("aria-live", "polite");

  const card = createElement("article", { className: "site-image-card" });
  const setBusy = (isBusy) => {
    card.querySelectorAll("button, input").forEach((element) => {
      element.disabled = isBusy;
    });
  };

  const saveButton = createElement("button", {
    type: "button",
    textContent: "Salvar alterações",
    onclick: async () => {
      const selectedImage = fileInput.files[0];
      const descriptionChanged = descriptionInput.value !== (image?.description || "");

      if (!selectedImage && !descriptionChanged) {
        setFeedback(feedback, "Nenhuma alteração para salvar.");
        return;
      }

      if (!selectedImage && !image) {
        setFeedback(feedback, "Escolha uma imagem antes de salvar a descrição.", "error");
        return;
      }

      setFeedback(feedback, "Salvando...");
      setBusy(true);

      try {
        if (selectedImage) {
          const formData = new FormData();
          formData.append("image", selectedImage);
          formData.append("description", descriptionInput.value);
          await request(`/api/admin/site-images/${key}`, {
            method: "PUT",
            body: formData,
          });
        } else {
          await request(`/api/admin/site-images/${image.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ description: descriptionInput.value }),
          });
        }

        await loadSiteImages();
      } catch (error) {
        setBusy(false);
        setFeedback(feedback, error.message, "error");
      }
    },
  });

  const deleteButton = image
    ? createElement("button", {
        type: "button",
        className: "danger-button",
        textContent: "Remover imagem",
        onclick: async () => {
          if (!window.confirm(`Remover a imagem de “${section.title}”?`)) return;

          setFeedback(feedback, "Removendo...");
          setBusy(true);
          try {
            await request(`/api/admin/site-images/${image.id}`, { method: "DELETE" });
            await loadSiteImages();
          } catch (error) {
            setBusy(false);
            setFeedback(feedback, error.message, "error");
          }
        },
      })
    : null;

  const visibilityButton = image
    ? createElement("button", {
        type: "button",
        className: "secondary-button",
        textContent: image.isVisible ? "Ocultar" : "Publicar",
        onclick: async () => {
          setFeedback(feedback, "Atualizando visibilidade...");
          setBusy(true);
          try {
            await request(`/api/admin/site-images/${image.id}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ isVisible: !image.isVisible }),
            });
            await loadSiteImages();
          } catch (error) {
            setBusy(false);
            setFeedback(feedback, error.message, "error");
          }
        },
      })
    : null;

  fileInput.addEventListener("change", () => {
    selectedFile.textContent = fileInput.files[0]
      ? fileInput.files[0].name
      : "Nenhum novo arquivo selecionado.";
  });

  const preview = image
    ? createElement("div", { className: "site-image-preview" }, [
        createElement("img", {
          src: `${API_BASE}${image.url}`,
          alt: image.description || section.title,
        }),
        createElement("span", {
          className: "site-image-status",
          textContent: "Imagem atual",
        }),
      ])
    : createElement("div", { className: "site-image-placeholder" }, [
        createElement("span", { textContent: "Sem imagem" }),
        createElement("small", {
          textContent: "Nenhuma imagem cadastrada para esta seção.",
        }),
      ]);

  const details = image
    ? createElement("small", {
        className: "site-image-details",
        textContent: `${image.originalName || "Arquivo local"} · Atualizada em ${formatDate(image.updatedAt)}`,
      })
    : null;

  const filePicker = createElement("div", { className: "site-image-file-picker" }, [
    createElement("label", {
      className: "file-picker-button secondary-button",
      htmlFor: fileInputId,
      textContent: image ? "Escolher imagem para substituir" : "Escolher imagem",
    }),
    fileInput,
    selectedFile,
  ]);
  const actions = createElement("div", { className: "site-image-actions" }, [saveButton]);
  if (visibilityButton) actions.append(visibilityButton);
  if (deleteButton) actions.append(deleteButton);

  const heading = createElement("div", { className: "site-image-heading" }, [
    createElement("div", {}, [
      createElement("h3", { textContent: section.title }),
      createElement("p", {
        className: "site-image-location",
        textContent: section.location,
      }),
    ]),
    createElement("small", {
      className: "site-image-key",
      textContent: `Chave interna: ${key}`,
    }),
  ]);

  card.append(heading, preview);
  if (details) card.append(details);
  card.append(
    createElement("label", { textContent: "Descrição" }, [descriptionInput]),
    filePicker,
    actions,
    feedback,
  );

  return card;
}

function getProjectCover(project) {
  return project?.images?.find((image) => image.isCover) || project?.images?.[0] || null;
}

function createWorkCarouselImageCard(image, index, images) {
  const descriptionInput = createElement("input", {
    type: "text",
    value: image.description || "",
    placeholder: "Descrição acessível da imagem",
    maxLength: 2000,
  });
  const feedback = createElement("p", { className: "feedback" });
  const saveDescription = createElement("button", {
    type: "button",
    className: "secondary-button",
    textContent: "Salvar descrição",
    onclick: async () => {
      try {
        await request(`/api/admin/work-carousel/images/${image.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ description: descriptionInput.value }),
        });
        await loadWorkCarousel();
      } catch (error) {
        setFeedback(feedback, error.message, "error");
      }
    },
  });
  const removeButton = createElement("button", {
    type: "button",
    className: "danger-button",
    textContent: "Remover",
    onclick: async () => {
      if (!window.confirm("Remover esta imagem do carrossel?")) return;
      try {
        await request(`/api/admin/work-carousel/images/${image.id}`, { method: "DELETE" });
        await loadWorkCarousel();
      } catch (error) {
        setFeedback(feedback, error.message, "error");
      }
    },
  });
  const move = async (offset) => {
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const imageIds = images.map((item) => item.id);
    [imageIds[index], imageIds[nextIndex]] = [imageIds[nextIndex], imageIds[index]];
    try {
      await request("/api/admin/work-carousel/images/order", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageIds }),
      });
      await loadWorkCarousel();
    } catch (error) {
      setFeedback(feedback, error.message, "error");
    }
  };
  const imageActions = createElement("div", { className: "image-actions" }, [
    saveDescription,
    createElement("button", {
      type: "button",
      className: "secondary-button",
      textContent: "Subir",
      disabled: index === 0,
      onclick: () => move(-1),
    }),
    createElement("button", {
      type: "button",
      className: "secondary-button",
      textContent: "Descer",
      disabled: index === images.length - 1,
      onclick: () => move(1),
    }),
    removeButton,
  ]);
  return createElement("article", { className: "image-card" }, [
    createElement("img", {
      src: `${API_BASE}${image.url}`,
      alt: image.description || "Imagem do carrossel Nosso trabalho",
    }),
    createElement("small", { textContent: `Ordem ${index + 1}` }),
    descriptionInput,
    imageActions,
    feedback,
  ]);
}

function renderSelectedWorkCarouselProject(project) {
  workCarouselSelectedProject.replaceChildren();
  if (!project) {
    workCarouselSelectedProject.append(
      createElement("div", { className: "work-carousel-empty", textContent: "Nenhum projeto selecionado." }),
    );
    return;
  }

  const cover = project.coverImage;
  const card = createElement("article", { className: "selected-work-project" });
  if (cover) {
    card.append(createElement("img", {
      src: `${API_BASE}${cover.url}`,
      alt: cover.description || project.title,
    }));
  } else {
    card.append(createElement("div", { className: "work-carousel-placeholder", textContent: "Sem capa" }));
  }
  card.append(
    createElement("div", {}, [
      createElement("h3", { textContent: project.title }),
      createElement("p", {
        textContent: project.isVisible
          ? `${project.imageCount} imagem(ns) serão utilizadas.`
          : "Este projeto está oculto e não aparece no carrossel público.",
      }),
    ]),
  );
  workCarouselSelectedProject.append(card);
}

function renderProjectSelector() {
  const visibleProjects = projectsCache.filter((project) => project.isVisible);
  projectSelectorList.replaceChildren(
    ...visibleProjects.map((project) => {
      const cover = getProjectCover(project);
      const card = createElement("button", {
        type: "button",
        className: `project-picker-card${selectedProjectDraftId === project.id ? " is-selected" : ""}`,
        onclick: () => {
          selectedProjectDraftId = project.id;
          renderProjectSelector();
        },
      });
      card.setAttribute("aria-pressed", String(selectedProjectDraftId === project.id));
      card.append(
        cover
          ? createElement("img", { src: `${API_BASE}${cover.url}`, alt: cover.description || project.title })
          : createElement("div", { className: "work-carousel-placeholder", textContent: "Sem capa" }),
        createElement("strong", { textContent: project.title }),
        createElement("small", { textContent: `${project.images.length} imagem(ns)` }),
      );
      return card;
    }),
  );
  setFeedback(
    projectSelectorFeedback,
    visibleProjects.length ? "" : "Nenhum projeto publicado disponível.",
    visibleProjects.length ? "" : "error",
  );
}

function toggleWorkCarouselViews(mode) {
  workCarouselCustomView.hidden = mode !== "CUSTOM";
  workCarouselProjectView.hidden = mode !== "PROJECT";
}

function renderWorkCarousel(config) {
  workCarouselConfig = config;
  document.querySelector(`#work-mode-${config.mode.toLowerCase()}`).checked = true;
  toggleWorkCarouselViews(config.mode);
  workCarouselImagesList.replaceChildren(
    ...config.images.map((image, index) => createWorkCarouselImageCard(image, index, config.images)),
  );
  if (!config.images.length) {
    workCarouselImagesList.append(
      createElement("p", { className: "work-carousel-empty", textContent: "Nenhuma imagem personalizada cadastrada." }),
    );
  }
  renderSelectedWorkCarouselProject(config.selectedProject);
  setFeedback(workCarouselFeedback, "");
}

async function loadWorkCarousel() {
  setFeedback(workCarouselFeedback, "Carregando...");
  try {
    const data = await request("/api/admin/work-carousel");
    renderWorkCarousel(data.config);
  } catch (error) {
    setFeedback(workCarouselFeedback, error.message, "error");
  }
}

async function saveWorkCarouselMode() {
  const mode = document.querySelector('input[name="work-carousel-mode"]:checked')?.value;
  const body = { mode };
  if (mode === "PROJECT") {
    if (!workCarouselConfig?.selectedProject?.id) {
      setFeedback(workCarouselModeFeedback, "Selecione um projeto antes de salvar este modo.", "error");
      return;
    }
    body.selectedProjectId = workCarouselConfig.selectedProject.id;
  }

  setFeedback(workCarouselModeFeedback, "Salvando...");
  try {
    const data = await request("/api/admin/work-carousel", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    renderWorkCarousel(data.config);
    setFeedback(workCarouselModeFeedback, "Modo salvo.", "success");
  } catch (error) {
    setFeedback(workCarouselModeFeedback, error.message, "error");
  }
}

async function uploadWorkCarouselImages() {
  if (workCarouselUploadInProgress || !workCarouselFileInput.files.length) {
    return;
  }

  workCarouselUploadInProgress = true;
  const formData = new FormData();
  for (const file of workCarouselFileInput.files) formData.append("images", file);
  workCarouselFileInput.disabled = true;
  setFeedback(workCarouselCustomFeedback, "Enviando imagens...");
  try {
    await request("/api/admin/work-carousel/images", { method: "POST", body: formData });
    workCarouselFileInput.value = "";
    await loadWorkCarousel();
    setFeedback(workCarouselCustomFeedback, "Imagens adicionadas automaticamente.", "success");
  } catch (error) {
    setFeedback(workCarouselCustomFeedback, error.message, "error");
  } finally {
    workCarouselFileInput.disabled = false;
    workCarouselUploadInProgress = false;
  }
}

function handleWorkCarouselModeChange(event) {
  toggleWorkCarouselViews(event.target.value);
  setFeedback(workCarouselModeFeedback, "");
}

function openProjectSelector() {
  selectedProjectDraftId = workCarouselConfig?.selectedProject?.id || null;
  renderProjectSelector();
  projectSelectorModal.showModal();
}

async function saveProjectSelection() {
  if (!selectedProjectDraftId) {
    setFeedback(projectSelectorFeedback, "Selecione um projeto publicado.", "error");
    return;
  }
  projectSelectorSaveButton.disabled = true;
  try {
    const data = await request("/api/admin/work-carousel", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "PROJECT", selectedProjectId: selectedProjectDraftId }),
    });
    renderWorkCarousel(data.config);
    projectSelectorModal.close();
  } catch (error) {
    setFeedback(projectSelectorFeedback, error.message, "error");
  } finally {
    projectSelectorSaveButton.disabled = false;
  }
}

async function loadSiteImages() {
  setFeedback(siteImagesFeedback, "Carregando...");
  try {
    const data = await request("/api/admin/site-images");
    const imagesByKey = new Map(data.images.map((image) => [image.key, image]));
    siteImagesList.replaceChildren(
      ...SITE_IMAGE_KEYS.map((key) => createSiteImageCard(key, imagesByKey.get(key))),
    );
    setFeedback(siteImagesFeedback, "");
  } catch (error) {
    setFeedback(siteImagesFeedback, error.message, "error");
  }
}

async function loadProjects() {
  setFeedback(projectsFeedback, "Carregando...");
  try {
    const data = await request("/api/admin/projects");
    projectsCache = data.projects;
    projectsList.replaceChildren(...data.projects.map(createProjectCard));
    setFeedback(projectsFeedback, data.projects.length ? "" : "Nenhum projeto cadastrado.");
    await loadWorkCarousel();
  } catch (error) {
    setFeedback(projectsFeedback, error.message, "error");
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFeedback(loginFeedback, "Entrando...");

  try {
    const data = await request("/api/admin/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: document.querySelector("#login-email").value,
        password: document.querySelector("#login-password").value,
      }),
    });
    showDashboard(data.user);
    loginForm.reset();
    await loadProjects();
    await loadSiteImages();
  } catch (error) {
    setFeedback(loginFeedback, error.message, "error");
  }
});

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFeedback(projectFeedback, "Criando...");

  try {
    await request("/api/admin/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: document.querySelector("#project-title").value,
        description: document.querySelector("#project-description").value,
      }),
    });
    projectForm.reset();
    setFeedback(projectFeedback, "Projeto criado como oculto.", "success");
    await loadProjects();
  } catch (error) {
    setFeedback(projectFeedback, error.message, "error");
  }
});

document.querySelector("#refresh-button").addEventListener("click", loadProjects);
document
  .querySelector("#refresh-site-images-button")
  .addEventListener("click", loadSiteImages);
document
  .querySelector("#refresh-work-carousel-button")
  .addEventListener("click", loadWorkCarousel);
document
  .querySelector("#save-work-carousel-mode")
  .addEventListener("click", saveWorkCarouselMode);
workCarouselFileInput.addEventListener("change", uploadWorkCarouselImages);
document.querySelectorAll('input[name="work-carousel-mode"]').forEach((input) => {
  input.addEventListener("change", handleWorkCarouselModeChange);
});
document
  .querySelector("#select-work-carousel-project")
  .addEventListener("click", openProjectSelector);
projectSelectorSaveButton.addEventListener("click", saveProjectSelection);

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await request("/api/admin/auth/logout", { method: "POST" });
  } finally {
    showLogin();
  }
});

try {
  const data = await request("/api/admin/auth/me");
  showDashboard(data.user);
  await loadProjects();
  await loadSiteImages();
} catch {
  showLogin();
}

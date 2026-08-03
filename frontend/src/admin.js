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
const SITE_IMAGE_KEYS = ["home.hero", "sobre.empresa", "contato.banner"];

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
  const fileInput = createElement("input", {
    type: "file",
    accept: "image/jpeg,image/png",
  });
  const descriptionInput = createElement("input", {
    type: "text",
    value: image?.description || "",
    placeholder: "Descrição da imagem",
    maxLength: 2000,
  });
  const uploadButton = createElement("button", {
    type: "button",
    textContent: image ? "Substituir imagem" : "Adicionar imagem",
    onclick: async () => {
      if (!fileInput.files.length) return;
      const formData = new FormData();
      formData.append("image", fileInput.files[0]);
      formData.append("description", descriptionInput.value);

      try {
        await request(`/api/admin/site-images/${key}`, {
          method: "PUT",
          body: formData,
        });
        await loadSiteImages();
      } catch (error) {
        setFeedback(siteImagesFeedback, error.message, "error");
      }
    },
  });
  const saveButton = image
    ? createElement("button", {
        type: "button",
        className: "secondary-button",
        textContent: "Salvar descrição",
        onclick: async () => {
          try {
            await request(`/api/admin/site-images/${image.id}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ description: descriptionInput.value }),
            });
            await loadSiteImages();
          } catch (error) {
            setFeedback(siteImagesFeedback, error.message, "error");
          }
        },
      })
    : null;
  const deleteButton = image
    ? createElement("button", {
        type: "button",
        className: "danger-button",
        textContent: "Remover",
        onclick: async () => {
          try {
            await request(`/api/admin/site-images/${image.id}`, { method: "DELETE" });
            await loadSiteImages();
          } catch (error) {
            setFeedback(siteImagesFeedback, error.message, "error");
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
          try {
            await request(`/api/admin/site-images/${image.id}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ isVisible: !image.isVisible }),
            });
            await loadSiteImages();
          } catch (error) {
            setFeedback(siteImagesFeedback, error.message, "error");
          }
        },
      })
    : null;
  const children = [createElement("strong", { textContent: key })];

  if (image) {
    children.push(
      createElement("img", {
        src: `${API_BASE}${image.url}`,
        alt: image.description || key,
      }),
    );
  }

  children.push(descriptionInput, fileInput, uploadButton);
  if (saveButton) children.push(saveButton);
  if (visibilityButton) children.push(visibilityButton);
  if (deleteButton) children.push(deleteButton);

  return createElement("article", { className: "site-image-card" }, children);
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
    projectsList.replaceChildren(...data.projects.map(createProjectCard));
    setFeedback(projectsFeedback, data.projects.length ? "" : "Nenhum projeto cadastrado.");
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

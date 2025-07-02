// public/app.js

// Variables globales
let currentUser = null;
let questions = [];
let users = [];

// Elementos del DOM
const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");
const questionModal = document.getElementById("question-modal");

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const hacerPreguntaBtn = document.getElementById("hacer-pregunta-btn");
const nuevaPreguntaBtn = document.getElementById("nueva-pregunta");
const verPreguntasBtn = document.getElementById("ver-preguntas");
const verPerfilBtn = document.getElementById("ver-perfil");

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
  loadMockData();
});

// Inicialización de la aplicación
function initializeApp() {
  console.log("Inicializando ¿Quién Sabe?...");
  checkUserSession();
  updateUI();
}

// Configurar event listeners
function setupEventListeners() {
  // Botones del header
  loginBtn.addEventListener("click", () => openModal("login-modal"));
  registerBtn.addEventListener("click", () => openModal("register-modal"));

  // Botones de acción
  hacerPreguntaBtn.addEventListener("click", () => {
    if (currentUser) {
      openModal("question-modal");
    } else {
      showNotification(
        "Debes iniciar sesión para hacer una pregunta",
        "warning"
      );
      openModal("login-modal");
    }
  });

  nuevaPreguntaBtn.addEventListener("click", () => {
    if (currentUser) {
      openModal("question-modal");
    } else {
      showNotification(
        "Debes iniciar sesión para hacer una pregunta",
        "warning"
      );
      openModal("login-modal");
    }
  });

  verPreguntasBtn.addEventListener("click", () => {
    document.getElementById("preguntas").scrollIntoView({ behavior: "smooth" });
  });

  verPerfilBtn.addEventListener("click", () => {
    if (currentUser) {
      showUserProfile();
    } else {
      showNotification("Debes iniciar sesión para ver tu perfil", "warning");
      openModal("login-modal");
    }
  });

  // Cerrar modales
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      closeModal(modal.id);
    });
  });

  // Cerrar modal al hacer click fuera
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target.id);
    }
  });

  // Formularios
  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document
    .getElementById("register-form")
    .addEventListener("submit", handleRegister);
  document
    .getElementById("question-form")
    .addEventListener("submit", handleNewQuestion);

  // NOTA: El event listener para '.btn-respond' fue eliminado de aquí
  // porque la lógica completa ya está en 'responder-logic.js'.
}

// Funciones de Modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
  document.body.style.overflow = "auto";

  // Limpiar formularios
  const forms = modal.querySelectorAll("form");
  forms.forEach((form) => form.reset());
}

// Funciones de autenticación
function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const username =
    formData.get("username") ||
    e.target.querySelector('input[type="text"]').value;
  const password =
    formData.get("password") ||
    e.target.querySelector('input[type="password"]').value;

  if (username && password) {
    currentUser = {
      id: Date.now(),
      username: username,
      level: 1,
      points: 0,
      badges: [],
      avatar: username.charAt(0).toUpperCase(),
    };

    showNotification("¡Bienvenido/a, " + username + "!", "success");
    closeModal("login-modal");
    updateUI();
    saveUserSession();
  } else {
    showNotification("Por favor completa todos los campos", "error");
  }
}

function handleRegister(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll("input");
  const username = inputs[0].value;
  const email = inputs[1].value;
  const password = inputs[2].value;
  const confirmPassword = inputs[3].value;

  if (!username || !email || !password || !confirmPassword) {
    showNotification("Por favor completa todos los campos", "error");
    return;
  }

  if (password !== confirmPassword) {
    showNotification("Las contraseñas no coinciden", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("La contraseña debe tener al menos 6 caracteres", "error");
    return;
  }

  currentUser = {
    id: Date.now(),
    username: username,
    email: email,
    level: 1,
    points: 0,
    badges: ["Nuevo Miembro"],
    avatar: username.charAt(0).toUpperCase(),
    joinDate: new Date().toISOString(),
  };

  showNotification(
    "¡Cuenta creada exitosamente! Bienvenido/a, " + username + "!",
    "success"
  );
  closeModal("register-modal");
  updateUI();
  saveUserSession();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateUI();
  showNotification("Sesión cerrada exitosamente", "success");
}

// Funciones de preguntas
function handleNewQuestion(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll("input, textarea");
  const title = inputs[0].value;
  const description = inputs[1].value;
  const tags = inputs[2].value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  if (!title || !description) {
    showNotification("Por favor completa el título y la descripción", "error");
    return;
  }

  const newQuestion = {
    id: Date.now(),
    title: title,
    description: description,
    tags: tags,
    author: currentUser.username,
    authorAvatar: currentUser.avatar,
    authorLevel: currentUser.level,
    timestamp: new Date(),
    responses: [],
    rating: 0,
    views: 0,
  };

  questions.unshift(newQuestion);
  renderQuestions();
  closeModal("question-modal");
  showNotification("¡Pregunta publicada exitosamente!", "success");

  document.getElementById("preguntas").scrollIntoView({ behavior: "smooth" });
}

// La función handleRespond fue eliminada.

// Funciones de UI
function updateUI() {
  const userActions = document.querySelector(".user-actions");

  if (currentUser) {
    userActions.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${currentUser.avatar}</div>
                <span class="username">${currentUser.username}</span>
                <span class="user-level">Nivel ${currentUser.level}</span>
            </div>
            <button class="btn-secondary" onclick="logout()">Cerrar Sesión</button>
        `;
  } else {
    userActions.innerHTML = `
            <button class="btn-secondary" id="login-btn">Iniciar Sesión</button>
            <button class="btn-primary" id="register-btn">Registrarse</button>
        `;

    document
      .getElementById("login-btn")
      .addEventListener("click", () => openModal("login-modal"));
    document
      .getElementById("register-btn")
      .addEventListener("click", () => openModal("register-modal"));
  }
}

function renderQuestions() {
  const questionsContainer = document.querySelector(".questions-container");

  if (questions.length === 0) {
    questionsContainer.innerHTML = `
            <div class="no-questions">
                <i class="fas fa-question-circle"></i>
                <h3>No hay preguntas aún</h3>
                <p>¡Sé el primero en hacer una pregunta!</p>
            </div>
        `;
    return;
  }

  questionsContainer.innerHTML = questions
    .map(
      (question) => `
        <div class="question-card" data-question-id="${question.id}">
            <div class="question-header">
                <div class="user-info">
                    <div class="user-avatar">${question.authorAvatar}</div>
                    <span class="username">${question.author}</span>
                    <span class="user-level">Nivel ${
                      question.authorLevel
                    }</span>
                </div>
                <span class="question-time">${formatTimeAgo(
                  question.timestamp
                )}</span>
            </div>
            <div class="question-content">
                <h3>${question.title}</h3>
                <p>${question.description}</p>
                <div class="question-tags">
                    ${question.tags
                      .map((tag) => `<span class="tag">${tag}</span>`)
                      .join("")}
                </div>
            </div>
            <div class="question-footer">
                <div class="question-stats">
                    <span><i class="fas fa-reply"></i> ${
                      question.responses.length
                    } respuestas</span>
                    <span><i class="fas fa-star"></i> ${question.rating.toFixed(
                      1
                    )}</span>
                    <span><i class="fas fa-eye"></i> ${
                      question.views
                    } vistas</span>
                </div>
                <button class="btn-respond">Responder</button>
            </div>
        </div>
    `
    )
    .join("");
}

// Funciones de utilidad
function formatTimeAgo(timestamp) {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `Hace ${minutes} minutos`;
  } else if (hours < 24) {
    return `Hace ${hours} horas`;
  } else {
    return `Hace ${days} días`;
  }
}

function showNotification(message, type = "success") {
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
}

function showUserProfile() {
  if (!currentUser) return;
  showNotification("Función de perfil en desarrollo", "warning");
}

// Funciones de persistencia
function saveUserSession() {
  if (currentUser) {
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }
}

function checkUserSession() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (e) {
      console.error("Error loading user session:", e);
      localStorage.removeItem("currentUser");
    }
  }
}

// Datos de ejemplo
function loadMockData() {
  const mockQuestions = [
    {
      id: 1,
      title: "¿Cómo resuelvo esta ecuación cuadrática?",
      description:
        "Necesito ayuda con x² + 5x + 6 = 0. No entiendo cómo usar la fórmula cuadrática...",
      tags: ["Matemática", "Álgebra"],
      author: "Ramiro_15",
      authorAvatar: "R",
      authorLevel: 2,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      responses: [
        {
          author: "Ana_Matematica",
          content: "Usa la fórmula: x = (-b ± √(b²-4ac)) / 2a",
        },
        {
          author: "Carlos_Historia",
          content: "Primero identifica a=1, b=5, c=6",
        },
        {
          author: "Sofia_Ciencias",
          content: "También puedes factorizar: (x+2)(x+3)=0",
        },
      ],
      rating: 4.2,
      views: 45,
    },
    {
      id: 2,
      title: "Ayuda con análisis sintáctico",
      description:
        '¿Me pueden ayudar a analizar sintácticamente esta oración? "Los estudiantes estudian mucho para el examen"',
      tags: ["Lengua", "Sintaxis"],
      author: "Maria_16",
      authorAvatar: "M",
      authorLevel: 3,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      responses: [
        {
          author: "Prof_Lengua",
          content:
            "Sujeto: Los estudiantes, Predicado: estudian mucho para el examen",
        },
      ],
      rating: 4.8,
      views: 32,
    },
    {
      id: 3,
      title: "¿Qué es la fotosíntesis?",
      description:
        "Tengo que hacer un trabajo sobre fotosíntesis pero no entiendo bien cómo funciona el proceso...",
      tags: ["Biología", "Ciencias"],
      author: "Lucas_17",
      authorAvatar: "L",
      authorLevel: 1,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
      responses: [
        {
          author: "Bio_Expert",
          content:
            "Es el proceso donde las plantas convierten luz solar en energía",
        },
        {
          author: "Sofia_Ciencias",
          content: "Usa CO2 + H2O + luz solar → glucosa + O2",
        },
        {
          author: "Verde_Ambiental",
          content: "Es fundamental para la vida en la Tierra",
        },
        {
          author: "Estudiante_Bio",
          content: "Ocurre en los cloroplastos de las células vegetales",
        },
        {
          author: "Naturalista",
          content: "Hay fotosíntesis oxigénica y anoxigénica",
        },
      ],
      rating: 4.6,
      views: 78,
    },
  ];

  questions = mockQuestions;
  renderQuestions();
}

// Funciones adicionales para futuras implementaciones
function searchQuestions(query) {
  console.log("Searching for:", query);
}

function filterByTag(tag) {
  console.log("Filtering by tag:", tag);
}

function sortQuestions(criteria) {
  console.log("Sorting by:", criteria);
}

function rateResponse(responseId, rating) {
  console.log("Rating response:", responseId, "with:", rating);
}

// Exportar funciones para uso externo si es necesario
window.QuienSabe = {
  openModal,
  closeModal,
  showNotification,
  logout,
  searchQuestions,
  filterByTag,
  sortQuestions,
};




































///////////////////////////////////////////////////////
// Lógica para el botón "Responder" en ¿Quién Sabe?
class ResponderSystem {
  constructor() {
    this.currentAnswerId = 1;
    this.init();
  }

  init() {
    this.bindResponderButtons();
    this.createResponseModal();
    this.bindLikeDislikeEvents(); // <-- Nuevo: vincula los eventos de like/dislike
  }

  // Vincular eventos a todos los botones "Responder"
  bindResponderButtons() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-respond")) {
        e.preventDefault();
        this.handleResponderClick(e.target);
      }
    });
  }

  // Nuevo: Vincular eventos a los botones de like/dislike
 // Nuevo: Vincular eventos a los botones de like/dislike con lógica de toggle
  bindLikeDislikeEvents() {
    document.addEventListener("click", (e) => {
      const clickedBtn = e.target.closest(".btn-like, .btn-dislike");
      if (!clickedBtn) return;

      const actionsContainer = clickedBtn.parentElement;
      const likeBtn = actionsContainer.querySelector(".btn-like");
      const dislikeBtn = actionsContainer.querySelector(".btn-dislike");
      
      const isLikeBtn = clickedBtn.classList.contains('btn-like');
      const otherBtn = isLikeBtn ? dislikeBtn : likeBtn;

      const countSpan = clickedBtn.querySelector("span");
      let currentCount = parseInt(countSpan.textContent, 10);

      // 1. Si el botón clickeado ya estaba votado, se quita el voto.
      if (clickedBtn.classList.contains("voted")) {
        countSpan.textContent = currentCount - 1;
        clickedBtn.classList.remove("voted");
      
      // 2. Si el OTRO botón estaba votado, se cambia el voto.
      } else if (otherBtn.classList.contains("voted")) {
        // Quitar voto del otro botón
        const otherCountSpan = otherBtn.querySelector('span');
        let otherCount = parseInt(otherCountSpan.textContent, 10);
        otherCountSpan.textContent = otherCount - 1;
        otherBtn.classList.remove('voted');

        // Agregar voto al botón clickeado
        countSpan.textContent = currentCount + 1;
        clickedBtn.classList.add("voted");

      // 3. Si no había ningún voto, se agrega el nuevo voto.
      } else {
        countSpan.textContent = currentCount + 1;
        clickedBtn.classList.add("voted");
      }
    });
  }

  // Lógica principal del botón responder
  handleResponderClick(button) {
    const questionCard = button.closest(".question-card");
    if (!questionCard) return;

    const questionData = this.extractQuestionData(questionCard);
    const existingForm = questionCard.querySelector(".answer-form");
    if (existingForm) {
      this.toggleAnswerForm(existingForm);
      return;
    }
    this.showAnswerForm(questionCard, questionData);
  }

  extractQuestionData(questionCard) {
    return {
      title: questionCard.querySelector(".question-content h3")?.textContent || "",
      id: Date.now(),
    };
  }

  showAnswerForm(questionCard, questionData) {
    const answerForm = this.createAnswerFormHTML(questionData.id);
    const questionFooter = questionCard.querySelector(".question-footer");
    questionFooter.insertAdjacentHTML("afterend", answerForm);
    this.bindAnswerFormEvents(questionCard, questionData);
    questionCard.querySelector(`#answer-content-${questionData.id}`)?.focus();
    questionCard.querySelector(".answer-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  createAnswerFormHTML(questionId) {
    return `
      <div class="answer-form" id="answer-form-${questionId}" style="background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 12px; padding: 20px; margin-top: 15px; animation: slideDown 0.3s ease-out;">
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <i class="fas fa-reply" style="color: #6c5ce7; margin-right: 8px;"></i>
          <h4 style="margin: 0; color: #2d3436;">Tu Respuesta</h4>
        </div>
        <form id="submit-answer-${questionId}">
          <div style="margin-bottom: 15px;">
            <textarea id="answer-content-${questionId}" placeholder="Escribe tu respuesta aquí. Sé claro y útil..." required style="width: 100%; min-height: 120px; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical; transition: border-color 0.3s ease;"></textarea>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2d3436;"><i class="fas fa-paperclip" style="margin-right: 5px;"></i>Adjuntar imagen (opcional)</label>
            <input type="file" id="answer-image-${questionId}" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn-cancel-answer" style="background: #636e72; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancelar</button>
            <button type="submit" style="background: #6c5ce7; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">Enviar Respuesta</button>
          </div>
        </form>
      </div>`;
  }

  bindAnswerFormEvents(questionCard, questionData) {
    const form = questionCard.querySelector(`#submit-answer-${questionData.id}`);
    const cancelBtn = questionCard.querySelector(".btn-cancel-answer");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleAnswerSubmit(questionCard, questionData);
    });
    cancelBtn?.addEventListener("click", () => {
      this.hideAnswerForm(questionCard, questionData.id);
    });
  }

  handleAnswerSubmit(questionCard, questionData) {
    const textarea = questionCard.querySelector(`#answer-content-${questionData.id}`);
    const fileInput = questionCard.querySelector(`#answer-image-${questionData.id}`);
    const answerContent = textarea.value.trim();

    if (answerContent.length < 10) {
      this.showNotification("La respuesta debe tener al menos 10 caracteres", "error");
      textarea.focus();
      return;
    }
    this.submitAnswer({ questionId: questionData.id, content: answerContent, image: fileInput?.files[0] || null, questionTitle: questionData.title }, questionCard);
  }

  async submitAnswer(answerData, questionCard) {
    this.showLoadingInForm(questionCard, answerData.questionId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const result = { success: true, answerId: this.currentAnswerId++, message: "Respuesta enviada correctamente" };
    if (result.success) {
      this.handleAnswerSuccess(questionCard, answerData, result);
    } else {
      this.handleAnswerError(new Error('Simulated Error'), questionCard, answerData.questionId);
    }
  }
  
  handleAnswerSuccess(questionCard, answerData, result) {
    this.hideAnswerForm(questionCard, answerData.questionId);
    this.updateAnswerCount(questionCard);
    this.showNotification("¡Respuesta enviada correctamente!", "success");
    this.addAnswerToDOM(questionCard, { content: answerData.content, author: "Tu Usuario", timestamp: new Date(), id: result.answerId });
  }

  handleAnswerError(error, questionCard, questionId) {
    this.hideLoadingInForm(questionCard, questionId);
    this.showNotification("Error al enviar la respuesta. Intenta nuevamente.", "error");
    console.error("Error enviando respuesta:", error);
  }

  showLoadingInForm(questionCard, questionId) {
    const submitBtn = questionCard.querySelector(`#submit-answer-${questionId} button[type="submit"]`);
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }
  }

  hideLoadingInForm(questionCard, questionId) {
    const submitBtn = questionCard.querySelector(`#submit-answer-${questionId} button[type="submit"]`);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Enviar Respuesta';
    }
  }

  toggleAnswerForm(form) {
    form.style.display = (form.style.display === "none") ? "block" : "none";
    if (form.style.display === "block") {
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  hideAnswerForm(questionCard, questionId) {
    const form = questionCard.querySelector(`#answer-form-${questionId}`);
    if (form) {
      form.style.animation = "slideUp 0.3s ease-out";
      setTimeout(() => form.remove(), 300);
    }
  }

  updateAnswerCount(questionCard) {
    const statsElement = questionCard.querySelector(".question-stats span");
    if (statsElement?.textContent.includes("respuestas")) {
      const currentCount = parseInt(statsElement.textContent.match(/\d+/)[0]);
      statsElement.innerHTML = `<i class="fas fa-reply"></i> ${currentCount + 1} respuestas`;
    }
  }
  
  // Modificado: Se agregó la barra de like/dislike
  addAnswerToDOM(questionCard, answerData) {
    const answersSection = questionCard.querySelector(".answers-section") || this.createAnswersSection(questionCard);
    const answerHTML = `
      <div class="answer-item" style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0; border-radius: 8px; animation: fadeIn 0.5s ease-out;">
        <div class="answer-content" style="margin-bottom: 10px; line-height: 1.6; color: #334155;">
          ${answerData.content}
        </div>
        <div class="answer-meta" style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; color: #64748b;">
            <i class="fas fa-user"></i> ${answerData.author} • 
            <i class="fas fa-clock"></i> Ahora mismo
          </div>
          <div class="answer-actions" style="display: flex; align-items: center; gap: 10px;">
            <button class="btn-like" style="background: none; border: none; cursor: pointer; color: #64748b; font-size: 14px; transition: all 0.2s;">
              <i class="fas fa-thumbs-up"></i> <span class="like-count">0</span>
            </button>
            <button class="btn-dislike" style="background: none; border: none; cursor: pointer; color: #64748b; font-size: 14px; transition: all 0.2s;">
              <i class="fas fa-thumbs-down"></i> <span class="dislike-count">0</span>
            </button>
          </div>
        </div>
      </div>`;
    answersSection.insertAdjacentHTML("beforeend", answerHTML);
  }

  createAnswersSection(questionCard) {
    const section = document.createElement("div");
    section.className = "answers-section";
    section.style.marginTop = "20px";
    section.innerHTML = '<h4><i class="fas fa-comments"></i> Respuestas</h4>';
    questionCard.appendChild(section);
    return section;
  }

  showNotification(message, type = "success") {
    const existing = document.querySelector(".notification-toast");
    if (existing) existing.remove();
    const notification = document.createElement("div");
    notification.className = "notification-toast";
    notification.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i> ${message}`;
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${type === "success" ? "#00b894" : "#e17055"}; color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 500; animation: slideInRight 0.3s ease-out;`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  createResponseModal() {
    if (document.getElementById("response-modal")) return;
    const modalHTML = `<div class="modal" id="response-modal"><div class="modal-content"><span class="close" id="response-modal-close">&times;</span><h2 id="response-modal-title">Responder Pregunta</h2><div id="response-question-preview"></div><form id="response-modal-form"><textarea id="response-modal-content" placeholder="Escribe tu respuesta detallada aquí..." rows="8" required></textarea><div class="file-upload"><label for="response-image-upload"><i class="fas fa-image"></i> Subir imagen (opcional)</label><input type="file" id="response-image-upload" accept="image/*" /></div><button type="submit" class="btn-primary"><i class="fas fa-paper-plane"></i> Enviar Respuesta</button></form></div></div>`;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.bindModalEvents();
  }

  bindModalEvents() {
    const modal = document.getElementById("response-modal");
    const closeBtn = document.getElementById("response-modal-close");
    closeBtn?.addEventListener("click", () => { modal.style.display = "none"; });
    window.addEventListener("click", (e) => { if (e.target === modal) { modal.style.display = "none"; } });
  }
}

// Inyectar CSS adicional para animaciones y estilos de voto
const additionalCSS = `
  @keyframes slideUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
  .btn-like.voted { color: #22c55e; transform: scale(1.1); }
  .btn-dislike.voted { color: #ef4444; transform: scale(1.1); }
  .answer-actions button { transition: color 0.2s, transform 0.2s; }
`;
const styleElement = document.createElement("style");
styleElement.textContent = additionalCSS;
document.head.appendChild(styleElement);

document.addEventListener("DOMContentLoaded", () => {
  window.responderSystem = new ResponderSystem();
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = ResponderSystem;
}
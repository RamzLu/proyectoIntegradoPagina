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

  // Botones de responder
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-respond")) {
      handleRespond(e);
    }
  });
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

  // Aquí implementarías la lógica real de autenticación
  // Por ahora, simulamos un login exitoso
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

  // Validaciones básicas
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

  // Aquí implementarías la lógica real de registro
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

  // Scroll to questions section
  document.getElementById("preguntas").scrollIntoView({ behavior: "smooth" });
}

function handleRespond(e) {
  if (!currentUser) {
    showNotification("Debes iniciar sesión para responder", "warning");
    openModal("login-modal");
    return;
  }

  const questionCard = e.target.closest(".question-card");
  const questionId = questionCard.dataset.questionId;

  // Aquí implementarías la lógica para abrir un modal de respuesta
  showNotification("Función de responder en desarrollo", "warning");
}

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

    // Re-attach event listeners
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
  // Remover notificación existente si hay una
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Mostrar notificación
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Ocultar después de 4 segundos
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
}

function showUserProfile() {
  if (!currentUser) return;

  // Aquí implementarías la lógica para mostrar el perfil del usuario
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
  // Datos de ejemplo para desarrollo
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
  // Implementar búsqueda de preguntas
  console.log("Searching for:", query);
}

function filterByTag(tag) {
  // Implementar filtro por etiqueta
  console.log("Filtering by tag:", tag);
}

function sortQuestions(criteria) {
  // Implementar ordenamiento (recientes, populares, sin responder)
  console.log("Sorting by:", criteria);
}

function rateResponse(responseId, rating) {
  // Implementar calificación de respuestas
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

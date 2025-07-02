// Objeto de datos del usuario por defecto, ahora con más estadísticas
let userDataDefault = {
  name: "Usuario Ejemplo",
  email: "usuario@ejemplo.com",
  bio: "¡Hola! Soy un usuario activo en esta plataforma.",
  title: "Novato Curioso",
  country: "es",
  totalXP: 15750,
  daysActive: 127,
  streak: 4,
  questionsAnswered: 521,
  correctAnswers: 427,
  bestStreak: 23,
  avgResponseTime: 5.2, // en segundos
  favoriteCategory: "Ciencia",
  avatar: null,
  performance: {
    Historia: 75,
    Ciencia: 90,
    Arte: 60,
    Geografía: 85,
    Deportes: 70,
  },
};

// Cargar datos desde localStorage o usar los datos por defecto
let userData =
  JSON.parse(localStorage.getItem("userProfileData")) || userDataDefault;

// Sistema de niveles y debounce
const levelSystem = {
  getLevelFromXP: (totalXP) => Math.floor(totalXP / 1000) + 1,
  getProgressInLevel: (totalXP) => totalXP % 1000,
  xpForNextLevel: 1000,
};
function debounce(func, delay = 1000) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Inicialización de la página
document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});

function initializePage() {
  setupTheme();
  updateDisplay();
  renderBadges();
  setupAvatarUpload();
  setupTabs();
  renderStreak();
  renderMissions();
  renderPerformanceChart();
  setupSettings();
  setupFormSubmission(); // Manejo del formulario
  setupAutosave(); // Autoguardado al escribir
  if (userData.avatar) {
    document.getElementById("avatar").src = userData.avatar;
  }
}

// --- Lógica de renderizado y actualización visual ---
function updateDisplay() {
  // Datos del perfil
  document.getElementById("displayName").textContent = userData.name;
  document.getElementById("displayTitle").textContent = userData.title;
  document.getElementById("displayEmail").textContent = userData.email;
  document.getElementById("displayBio").textContent = userData.bio;

  // Nivel y XP
  const userLevel = levelSystem.getLevelFromXP(userData.totalXP);
  const progressInLevel = levelSystem.getProgressInLevel(userData.totalXP);
  const userLevelEl = document.getElementById("userLevel");
  if (userLevelEl) userLevelEl.textContent = userLevel;
  const progressFillEl = document.getElementById("progressFill");
  if (progressFillEl) {
    const progressPercent =
      (progressInLevel / levelSystem.xpForNextLevel) * 100;
    progressFillEl.style.width = progressPercent + "%";
  }
  const progressTextEl = document.getElementById("progressText");
  if (progressTextEl)
    progressTextEl.textContent = `${progressInLevel} / ${levelSystem.xpForNextLevel} XP para el siguiente nivel`;

  // Estadísticas
  document.getElementById("totalXP").textContent =
    userData.totalXP.toLocaleString();
  document.getElementById("questionsAnswered").textContent =
    userData.questionsAnswered;
  const accuracy =
    userData.questionsAnswered > 0
      ? ((userData.correctAnswers / userData.questionsAnswered) * 100).toFixed(
          0
        ) + "%"
      : "0%";
  document.getElementById("accuracyRate").textContent = accuracy;
  document.getElementById("bestStreak").textContent = userData.bestStreak;
  document.getElementById(
    "avgTime"
  ).textContent = `${userData.avgResponseTime}s`;
  document.getElementById("favoriteCategory").textContent =
    userData.favoriteCategory;
}

function setupTabs() {
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");
  tabLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const tabId = link.getAttribute("data-tab");
      tabLinks.forEach((item) => item.classList.remove("active"));
      tabContents.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
      document.getElementById(`tab-${tabId}`).classList.add("active");
    });
  });
}

// --- Lógica de edición y guardado del perfil ---
function toggleEditMode() {
  document.querySelector(".profile-card").classList.add("edit-mode");
  document.getElementById("profileInfo").classList.add("hidden");
  document.getElementById("editForm").classList.remove("hidden");
  document.getElementById("editName").value = userData.name;
  document.getElementById("editTitle").value = userData.title;
  document.getElementById("editEmail").value = userData.email;
  document.getElementById("editBio").value = userData.bio;
}

function cancelEdit() {
  document.querySelector(".profile-card").classList.remove("edit-mode");
  document.getElementById("profileInfo").classList.remove("hidden");
  document.getElementById("editForm").classList.add("hidden");
}

function saveProfile(showNotif = false) {
  userData.name = document.getElementById("editName").value.trim();
  userData.title = document.getElementById("editTitle").value;
  userData.email = document.getElementById("editEmail").value.trim();
  userData.bio = document.getElementById("editBio").value.trim();
  localStorage.setItem("userProfileData", JSON.stringify(userData));
  updateDisplay();
  if (showNotif) {
    cancelEdit();
    showNotification("💾 Perfil actualizado correctamente!", "success");
  } else {
    const saveButton = document.getElementById("save-profile-btn");
    if (saveButton && !saveButton.dataset.saving) {
      saveButton.dataset.saving = "true";
      const originalText = saveButton.innerHTML;
      saveButton.innerHTML = "Guardando...";
      setTimeout(() => {
        saveButton.innerHTML = originalText;
        delete saveButton.dataset.saving;
      }, 1500);
    }
  }
}

// --- Manejo del envío del formulario ---
function setupFormSubmission() {
  const editForm = document.getElementById("editForm");
  if (editForm) {
    editForm.addEventListener("submit", (event) => {
      event.preventDefault(); // ¡Previene la recarga de la página!
      saveProfile(true); // Guarda los datos y muestra la notificación
    });
  }
}

function setupAutosave() {
  const debouncedSave = debounce(() => saveProfile(false), 1500);
  const editForm = document.getElementById("editForm");
  if (editForm) {
    editForm.addEventListener("input", (event) => {
      if (event.target.matches("input, textarea, select")) {
        debouncedSave();
      }
    });
  }
}

// --- Lógica para el avatar, tema y notificaciones ---
function setupAvatarUpload() {
  const avatarInput = document.getElementById("avatarInput");
  avatarInput?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const newAvatarSrc = e.target.result;
      document.getElementById("avatar").src = newAvatarSrc;
      userData.avatar = newAvatarSrc;
      localStorage.setItem("userProfileData", JSON.stringify(userData));
      showNotification("📸 Foto de perfil actualizada!", "success");
    };
    reader.readAsDataURL(file);
  });
}

function setupTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark-theme", savedTheme === "dark");
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-theme");
  const newTheme = isDark ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    if (theme === "dark") {
      themeToggle.innerHTML = `<i class="fas fa-sun"></i> Activar Modo Claro`;
    } else {
      themeToggle.innerHTML = `<i class="fas fa-moon"></i> Activar Modo Oscuro`;
    }
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 10px;
    color: white; z-index: 1001; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    background: ${
      type === "success"
        ? "linear-gradient(45deg, #26de81, #20bf6b)"
        : "linear-gradient(45deg, #ff6b6b, #ee5a52)"
    };`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// --- Resto de funciones de renderizado ---
function renderBadges() {
  const badgesGrid = document.getElementById("badgesGrid");
  if (!badgesGrid) return;
  badgesGrid.innerHTML = "";
  // Insignias disponibles
  const badges = [
    { id: "newcomer", name: "Novato", icon: "🌟", earned: true },
    { id: "active", name: "Activo", icon: "⚡", earned: true },
    { id: "social", name: "Social", icon: "👥", earned: true },
    { id: "explorer", name: "Explorador", icon: "🗺️", earned: true },
    { id: "expert", name: "Experto", icon: "🎓", earned: true },
    { id: "master", name: "Maestro", icon: "👑", earned: true },
    { id: "legend", name: "Leyenda", icon: "🏆", earned: false },
    { id: "champion", name: "Campeón", icon: "💎", earned: false },
  ];
  badges.forEach((badge) => {
    const badgeElement = document.createElement("div");
    badgeElement.className = `badge ${badge.earned ? "earned" : ""}`;
    badgeElement.innerHTML = `<div class="badge-icon">${badge.icon}</div><div>${badge.name}</div>`;
    badgeElement.title = badge.name;
    badgesGrid.appendChild(badgeElement);
  });
}

function renderMissions() {
  // Datos de misiones
  const dailyMissions = [
    {
      text: "Responde 10 preguntas",
      reward: "50 XP",
      icon: "🧠",
      current: 7,
      target: 10,
    },
    {
      text: "Inicia sesión",
      reward: "10 XP",
      icon: "📅",
      current: 1,
      target: 1,
    },
  ];
  const weeklyMissions = [
    {
      text: "Completa 5 quizzes",
      reward: "200 XP",
      icon: "🏆",
      current: 2,
      target: 5,
    },
  ];
  const milestones = [
    {
      text: "Alcanza el Nivel 20",
      reward: "500 XP",
      icon: "🚀",
      completed: false,
    },
    {
      text: "Consigue la insignia 'Maestro'",
      reward: "300 XP",
      icon: "👑",
      completed: true,
    },
  ];
  const container = document.getElementById("missionsContainer");
  if (!container) return;
  container.innerHTML = "";
  const createMissionSection = (title, missionsData) => {
    const sectionTitle = document.createElement("h4");
    sectionTitle.textContent = title;
    container.appendChild(sectionTitle);
    missionsData.forEach((mission) => {
      const isCompleted = mission.target
        ? mission.current / mission.target >= 1
        : mission.completed;
      const missionDiv = document.createElement("div");
      missionDiv.className = `mission-item ${isCompleted ? "completed" : ""}`;
      missionDiv.innerHTML = `<div class="mission-icon">${mission.icon}</div><div class="mission-details"><strong>${mission.text}</strong></div><div class="mission-reward">${mission.reward}</div>`;
      container.appendChild(missionDiv);
    });
  };
  createMissionSection("Misiones Diarias", dailyMissions);
  createMissionSection("Misiones Semanales", weeklyMissions);
  createMissionSection("Hitos", milestones);
}

function renderStreak() {
  const container = document.getElementById("streakVisualizer");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "streak-day";
    if (i < userData.streak) {
      dayDiv.classList.add("active");
    }
    container.appendChild(dayDiv);
  }
}

function renderPerformanceChart() {
  const ctx = document.getElementById("performanceChart")?.getContext("2d");
  if (!ctx) return;
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(userData.performance),
      datasets: [
        {
          label: "% de Aciertos",
          data: Object.values(userData.performance),
          backgroundColor: "rgba(102, 126, 234, 0.6)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: { y: { beginAtZero: true, max: 100 } },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function setupSettings() {
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle?.addEventListener("click", toggleTheme);
  document
    .querySelector(".btn-danger")
    ?.addEventListener("click", () =>
      alert(
        "Esta acción es permanente y no se puede deshacer. (Función no implementada)"
      )
    );
  document
    .querySelector(".btn-secondary.full-width")
    ?.addEventListener("click", () =>
      alert(
        "Se enviaría un correo para cambiar la contraseña. (Función no implementada)"
      )
    );
}

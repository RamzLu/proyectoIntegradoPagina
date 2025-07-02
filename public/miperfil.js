// Datos del usuario (simulando una base de datos)
let userData = {
    name: "Usuario Ejemplo",
    email: "usuario@ejemplo.com",
    bio: "¡Hola! Soy un usuario activo en esta plataforma.",
    country: "es",
    level: 15,
    xp: 750,
    totalXP: 15750,
    daysActive: 127,
    avatar: null
};

// Sistema de niveles
const levelSystem = {
    getXPForLevel: (level) => level * 100,
    getLevelFromXP: (totalXP) => Math.floor(totalXP / 1000) + 1,
    getProgressInLevel: (totalXP) => totalXP % 1000
};

// Insignias disponibles
const badges = [
    { id: 'newcomer', name: 'Novato', icon: '🌟', requirement: 100, earned: true },
    { id: 'active', name: 'Activo', icon: '⚡', requirement: 500, earned: true },
    { id: 'social', name: 'Social', icon: '👥', requirement: 1000, earned: true },
    { id: 'explorer', name: 'Explorador', icon: '🗺️', requirement: 2000, earned: true },
    { id: 'expert', name: 'Experto', icon: '🎓', requirement: 5000, earned: true },
    { id: 'master', name: 'Maestro', icon: '👑', requirement: 10000, earned: true },
    { id: 'legend', name: 'Leyenda', icon: '🏆', requirement: 15000, earned: true },
    { id: 'champion', name: 'Campeón', icon: '💎', requirement: 20000, earned: false },
    { id: 'ultimate', name: 'Supremo', icon: '🌟', requirement: 50000, earned: false }
];

// Inicializar página
function initializePage() {
    updateDisplay();
    renderBadges();
    setupAvatarUpload();
}

// Actualizar visualización
function updateDisplay() {
    document.getElementById('displayName').textContent = userData.name;
    document.getElementById('displayEmail').textContent = userData.email;
    document.getElementById('displayBio').textContent = userData.bio;
    
    // Actualizar nivel y XP
    userData.level = levelSystem.getLevelFromXP(userData.totalXP);
    userData.xp = levelSystem.getProgressInLevel(userData.totalXP);
    
    document.getElementById('userLevel').textContent = userData.level;
    document.getElementById('totalXP').textContent = userData.totalXP.toLocaleString();
    document.getElementById('daysActive').textContent = userData.daysActive;
    
    // Actualizar barra de progreso
    const progress = (userData.xp / 1000) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `${userData.xp} / 1000 XP para el siguiente nivel`;
    
    // Contar insignias ganadas
    const earnedBadges = badges.filter(badge => badge.earned).length;
    document.getElementById('badgesEarned').textContent = earnedBadges;
}

// Renderizar insignias
function renderBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    badgesGrid.innerHTML = '';
    
    badges.forEach(badge => {
        const badgeElement = document.createElement('div');
        badgeElement.className = `badge ${badge.earned ? 'earned' : ''}`;
        badgeElement.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div style="font-size: 0.9em; font-weight: bold;">${badge.name}</div>
            <div style="font-size: 0.7em; margin-top: 5px;">
                ${badge.earned ? '¡Desbloqueada!' : `${badge.requirement} XP`}
            </div>
        `;
        
        badgeElement.addEventListener('click', () => showBadgeDetails(badge));
        badgesGrid.appendChild(badgeElement);
    });
}

// Mostrar detalles de insignia
function showBadgeDetails(badge) {
    alert(`${badge.icon} ${badge.name}\n\n${badge.earned ? 'Ya has desbloqueado esta insignia.' : `Necesitas ${badge.requirement} XP total para desbloquear esta insignia.`}`);
}

// Configurar subida de avatar
function setupAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput');
    const editAvatarInput = document.getElementById('editAvatarInput');
    const avatar = document.getElementById('avatar');
    const editAvatar = document.getElementById('editAvatar');
    
    // Configurar subida desde vista principal
    avatarInput.addEventListener('change', function(e) {
        handleAvatarUpload(e, avatar);
    });
    
    // Configurar subida desde modo edición
    editAvatarInput.addEventListener('change', function(e) {
        handleAvatarUpload(e, editAvatar);
    });
}

// Manejar subida de avatar
function handleAvatarUpload(event, targetImage) {
    const file = event.target.files[0];
    if (file) {
        // Validar tamaño de archivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es demasiado grande. Máximo 5MB.');
            return;
        }
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            targetImage.src = e.target.result;
            userData.avatar = e.target.result;
            
            // Actualizar ambas imágenes si se cambió desde el modo edición
            if (targetImage.id === 'editAvatar') {
                document.getElementById('avatar').src = e.target.result;
            }
            
            // Animación de confirmación
            targetImage.style.transform = 'scale(1.1)';
            setTimeout(() => {
                targetImage.style.transform = 'scale(1)';
            }, 200);
            
            // Mostrar mensaje de éxito
            showNotification('📸 Foto de perfil actualizada!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Alternar modo edición
function toggleEditMode() {
    const container = document.querySelector('.profile-card');
    const profileInfo = document.getElementById('profileInfo');
    const editForm = document.getElementById('editForm');
    
    container.classList.add('edit-mode');
    profileInfo.classList.add('hidden');
    editForm.classList.remove('hidden');
    
    // Cargar datos actuales en el formulario
    document.getElementById('editName').value = userData.name;
    document.getElementById('editEmail').value = userData.email;
    document.getElementById('editBio').value = userData.bio;
    document.getElementById('editCountry').value = userData.country;
    
    // Sincronizar avatar en modo edición
    const currentAvatar = document.getElementById('avatar').src;
    document.getElementById('editAvatar').src = currentAvatar;
}

// Guardar perfil
function saveProfile() {
    // Validar campos
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    
    if (!name) {
        alert('El nombre es requerido.');
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        alert('Por favor ingresa un email válido.');
        return;
    }
    
    if (bio.length > 200) {
        alert('La biografía debe tener máximo 200 caracteres.');
        return;
    }
    
    // Guardar datos
    userData.name = name;
    userData.email = email;
    userData.bio = bio;
    userData.country = document.getElementById('editCountry').value;
    
    updateDisplay();
    cancelEdit();
    
    // Animación de confirmación
    const button = event.target;
    const originalText = button.textContent;
    const originalBg = button.style.background;
    
    button.textContent = '✅ ¡Guardado!';
    button.style.background = '#26de81';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBg;
    }, 2000);
    
    // Mostrar notificación
    showNotification('💾 Perfil actualizado correctamente!', 'success');
}

// Cancelar edición
function cancelEdit() {
    const container = document.querySelector('.profile-card');
    const profileInfo = document.getElementById('profileInfo');
    const editForm = document.getElementById('editForm');
    
    container.classList.remove('edit-mode');
    profileInfo.classList.remove('hidden');
    editForm.classList.add('hidden');
}

// Añadir XP aleatorio (función de prueba)
function addRandomXP() {
    const xpGain = 100;
    const oldLevel = userData.level;
    userData.totalXP += xpGain;
    
    // Verificar nuevas insignias
    checkNewBadges();
    
    // Verificar subida de nivel
    const newLevel = levelSystem.getLevelFromXP(userData.totalXP);
    if (newLevel > oldLevel) {
        showLevelUpNotification(newLevel);
    }
    
    updateDisplay();
    renderBadges();
    
    // Mostrar notificación de XP
    showXPNotification(xpGain);
}

// Verificar nuevas insignias
function checkNewBadges() {
    badges.forEach(badge => {
        if (!badge.earned && userData.totalXP >= badge.requirement) {
            badge.earned = true;
            showBadgeUnlocked(badge);
        }
    });
}

// Mostrar notificación de XP
function showXPNotification(xp) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #26de81, #20bf6b);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = `+${xp} XP ganados!`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Mostrar insignia desbloqueada
function showBadgeUnlocked(badge) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(45deg, #feca57, #ff9ff3);
        color: white;
        padding: 20px;
        border-radius: 15px;
        font-weight: bold;
        z-index: 1000;
        text-align: center;
        animation: bounceIn 0.5s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    notification.innerHTML = `
        <div style="font-size: 2em;">${badge.icon}</div>
        <div>¡Nueva Insignia!</div>
        <div style="font-size: 0.9em; margin-top: 5px;">${badge.name}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Mostrar notificación de subida de nivel
function showLevelUpNotification(newLevel) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        padding: 30px;
        border-radius: 20px;
        font-weight: bold;
        z-index: 1001;
        text-align: center;
        animation: bounceIn 0.5s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    `;
    notification.innerHTML = `
        <div style="font-size: 3em;">🎉</div>
        <div style="font-size: 1.5em; margin: 10px 0;">¡NIVEL SUPERIOR!</div>
        <div style="font-size: 2em; color: #feca57;">Nivel ${newLevel}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Mostrar notificación genérica
function showNotification(message, type = 'info') {
    const colors = {
        success: 'linear-gradient(45deg, #26de81, #20bf6b)',
        error: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
        info: 'linear-gradient(45deg, #667eea, #764ba2)'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Agregar animación de salida al CSS dinámicamente
function addSlideOutAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOut {
            from { 
                transform: translateX(0); 
                opacity: 1; 
            }
            to { 
                transform: translateX(100%); 
                opacity}
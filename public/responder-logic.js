// Lógica para el botón "Responder" en ¿Quién Sabe?
class ResponderSystem {
  constructor() {
    this.currentAnswerId = 1;
    this.answerVotes = new Map(); // Almacenar votos: answerId -> {likes: count, dislikes: count, userVote: 'like'/'dislike'/null}
    this.init();
  }

  init() {
    this.bindResponderButtons();
    this.createResponseModal();
    this.bindVoteEvents();
  }

  // Vincular eventos de votación
  bindVoteEvents() {
    document.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("vote-btn") ||
        e.target.closest(".vote-btn")
      ) {
        e.preventDefault();
        const voteBtn = e.target.classList.contains("vote-btn")
          ? e.target
          : e.target.closest(".vote-btn");
        this.handleVoteClick(voteBtn);
      }
    });
  }

  // Manejar click en botones de voto
  handleVoteClick(voteBtn) {
    const answerId = voteBtn.dataset.answerId;
    const voteType = voteBtn.dataset.voteType; // 'like' o 'dislike'

    if (!answerId || !voteType) return;

    this.processVote(answerId, voteType, voteBtn);
  }

  // Procesar voto
  processVote(answerId, voteType, clickedBtn) {
    // Inicializar votos si no existen
    if (!this.answerVotes.has(answerId)) {
      this.answerVotes.set(answerId, {
        likes: 0,
        dislikes: 0,
        userVote: null,
      });
    }

    const voteData = this.answerVotes.get(answerId);
    const previousVote = voteData.userVote;

    // Lógica de votación
    if (previousVote === voteType) {
      // Si ya votó lo mismo, remover voto
      voteData[voteType + "s"]--;
      voteData.userVote = null;
    } else {
      // Si votó diferente o no había votado
      if (previousVote) {
        // Remover voto anterior
        voteData[previousVote + "s"]--;
      }
      // Agregar nuevo voto
      voteData[voteType + "s"]++;
      voteData.userVote = voteType;
    }

    // Actualizar UI
    this.updateVoteUI(answerId, voteData);

    // Simular envío al servidor
    this.sendVoteToServer(answerId, voteType, voteData.userVote);
  }

  // Actualizar interfaz de votación
  updateVoteUI(answerId, voteData) {
    const answerElement = document.querySelector(
      `[data-answer-id="${answerId}"]`
    );
    if (!answerElement) return;

    const likeBtn = answerElement.querySelector(
      '.vote-btn[data-vote-type="like"]'
    );
    const dislikeBtn = answerElement.querySelector(
      '.vote-btn[data-vote-type="dislike"]'
    );
    const likeCount = answerElement.querySelector(".like-count");
    const dislikeCount = answerElement.querySelector(".dislike-count");

    // Actualizar contadores
    if (likeCount) likeCount.textContent = voteData.likes;
    if (dislikeCount) dislikeCount.textContent = voteData.dislikes;

    // Actualizar estilos de botones
    if (likeBtn) {
      likeBtn.classList.toggle("voted", voteData.userVote === "like");
      likeBtn.style.color =
        voteData.userVote === "like" ? "#00b894" : "#636e72";
      likeBtn.style.backgroundColor =
        voteData.userVote === "like" ? "#e8f5e8" : "transparent";
    }

    if (dislikeBtn) {
      dislikeBtn.classList.toggle("voted", voteData.userVote === "dislike");
      dislikeBtn.style.color =
        voteData.userVote === "dislike" ? "#e17055" : "#636e72";
      dislikeBtn.style.backgroundColor =
        voteData.userVote === "dislike" ? "#ffeaa7" : "transparent";
    }
  }

  // Simular envío de voto al servidor
  async sendVoteToServer(answerId, voteType, userVote) {
    try {
      // Aquí iría tu llamada al backend
      /*
      const response = await fetch('/api/answers/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          answerId: answerId,
          voteType: voteType,
          action: userVote ? 'add' : 'remove'
        })
      });
      
      if (!response.ok) throw new Error('Error al enviar voto');
      */

      console.log(
        `Voto enviado: ${answerId} - ${voteType} - ${
          userVote ? "add" : "remove"
        }`
      );
    } catch (error) {
      console.error("Error enviando voto:", error);
      this.showNotification("Error al registrar tu voto", "error");
    }
  }

  // Vincular eventos a todos los botones "Responder"
  bindResponderButtons() {
    // Usar delegación de eventos para manejar botones dinámicos
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-respond")) {
        e.preventDefault();
        this.handleResponderClick(e.target);
      }
    });
  }

  // Lógica principal del botón responder
  handleResponderClick(button) {
    // Encontrar la tarjeta de pregunta padre
    const questionCard = button.closest(".question-card");
    if (!questionCard) return;

    // Extraer información de la pregunta
    const questionData = this.extractQuestionData(questionCard);

    // Verificar si ya existe un formulario de respuesta en esta pregunta
    const existingForm = questionCard.querySelector(".answer-form");
    if (existingForm) {
      // Si existe, alternar visibilidad
      this.toggleAnswerForm(existingForm);
      return;
    }

    // Crear y mostrar formulario de respuesta
    this.showAnswerForm(questionCard, questionData);
  }

  // Extraer datos de la pregunta del DOM
  extractQuestionData(questionCard) {
    const title =
      questionCard.querySelector(".question-content h3")?.textContent || "";
    const content =
      questionCard.querySelector(".question-content p")?.textContent || "";
    const username = questionCard.querySelector(".username")?.textContent || "";
    const time =
      questionCard.querySelector(".question-time")?.textContent || "";
    const tags = Array.from(questionCard.querySelectorAll(".tag")).map(
      (tag) => tag.textContent
    );

    return {
      title,
      content,
      username,
      time,
      tags,
      id: Date.now(), // ID único basado en timestamp
    };
  }

  // Crear y mostrar formulario de respuesta inline
  showAnswerForm(questionCard, questionData) {
    const answerForm = this.createAnswerFormHTML(questionData.id);

    // Insertar el formulario después del footer de la pregunta
    const questionFooter = questionCard.querySelector(".question-footer");
    questionFooter.insertAdjacentHTML("afterend", answerForm);

    // Agregar event listeners al formulario recién creado
    this.bindAnswerFormEvents(questionCard, questionData);

    // Enfocar el textarea
    const textarea = questionCard.querySelector(
      `#answer-content-${questionData.id}`
    );
    if (textarea) {
      textarea.focus();
    }

    // Scroll suave hacia el formulario
    const form = questionCard.querySelector(".answer-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Crear HTML del formulario de respuesta
  createAnswerFormHTML(questionId) {
    return `
            <div class="answer-form" id="answer-form-${questionId}" style="
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                padding: 20px;
                margin-top: 15px;
                animation: slideDown 0.3s ease-out;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <i class="fas fa-reply" style="color: #6c5ce7; margin-right: 8px;"></i>
                    <h4 style="margin: 0; color: #2d3436;">Tu Respuesta</h4>
                </div>
                
                <form id="submit-answer-${questionId}">
                    <div style="margin-bottom: 15px;">
                        <textarea 
                            id="answer-content-${questionId}"
                            placeholder="Escribe tu respuesta aquí. Sé claro y útil para ayudar al estudiante..."
                            required
                            style="
                                width: 100%;
                                min-height: 120px;
                                padding: 12px;
                                border: 2px solid #ddd;
                                border-radius: 8px;
                                font-family: inherit;
                                font-size: 14px;
                                line-height: 1.5;
                                resize: vertical;
                                transition: border-color 0.3s ease;
                            "
                            onkeydown="this.style.borderColor = '#6c5ce7'"
                            onblur="this.style.borderColor = '#ddd'"
                        ></textarea>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #2d3436;">
                            <i class="fas fa-paperclip" style="margin-right: 5px;"></i>
                            Adjuntar imagen (opcional)
                        </label>
                        <input 
                            type="file" 
                            id="answer-image-${questionId}"
                            accept="image/*"
                            style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                            "
                        >
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button 
                            type="button" 
                            class="btn-cancel-answer"
                            style="
                                background: #636e72;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                transition: background-color 0.3s ease;
                            "
                            onmouseover="this.style.backgroundColor='#2d3436'"
                            onmouseout="this.style.backgroundColor='#636e72'"
                        >
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button 
                            type="submit"
                            style="
                                background: #6c5ce7;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                cursor: pointer;
                                font-size: 14px;
                                font-weight: 500;
                                transition: background-color 0.3s ease;
                            "
                            onmouseover="this.style.backgroundColor='#5f4fcf'"
                            onmouseout="this.style.backgroundColor='#6c5ce7'"
                        >
                            <i class="fas fa-paper-plane"></i> Enviar Respuesta
                        </button>
                    </div>
                </form>
            </div>
            
            <style>
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
        `;
  }

  // Vincular eventos al formulario de respuesta
  bindAnswerFormEvents(questionCard, questionData) {
    const form = questionCard.querySelector(
      `#submit-answer-${questionData.id}`
    );
    const cancelBtn = questionCard.querySelector(".btn-cancel-answer");

    // Manejar envío del formulario
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAnswerSubmit(questionCard, questionData);
      });
    }

    // Manejar botón cancelar
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.hideAnswerForm(questionCard, questionData.id);
      });
    }
  }

  // Manejar envío de respuesta
  handleAnswerSubmit(questionCard, questionData) {
    const textarea = questionCard.querySelector(
      `#answer-content-${questionData.id}`
    );
    const fileInput = questionCard.querySelector(
      `#answer-image-${questionData.id}`
    );

    if (!textarea) return;

    const answerContent = textarea.value.trim();

    // Validaciones
    if (!answerContent) {
      this.showNotification("Por favor escribe una respuesta", "error");
      textarea.focus();
      return;
    }

    if (answerContent.length < 10) {
      this.showNotification(
        "La respuesta debe tener al menos 10 caracteres",
        "error"
      );
      textarea.focus();
      return;
    }

    // Simular envío (aquí iría tu llamada AJAX al backend)
    if (fileInput?.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.submitAnswer(
          {
            questionId: questionData.id,
            content: answerContent,
            image: reader.result, // base64
            questionTitle: questionData.title,
          },
          questionCard
        );
      };

      reader.readAsDataURL(file);
    } else {
      this.submitAnswer(
        {
          questionId: questionData.id,
          content: answerContent,
          image: null,
          questionTitle: questionData.title,
        },
        questionCard
      );
    }
  }

  // Simular envío de respuesta al servidor
  async submitAnswer(answerData, questionCard) {
    try {
      // Mostrar loading
      this.showLoadingInForm(questionCard, answerData.questionId);

      // Simular delay de red (remover en producción)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Aquí iría tu fetch al backend:
      /*
            const response = await fetch('/api/answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(answerData)
            });
            
            if (!response.ok) throw new Error('Error al enviar respuesta');
            
            const result = await response.json();
            */

      // Simular respuesta exitosa
      const result = {
        success: true,
        answerId: this.currentAnswerId++,
        message: "Respuesta enviada correctamente",
      };

      if (result.success) {
        this.handleAnswerSuccess(questionCard, answerData, result);
      }
    } catch (error) {
      this.handleAnswerError(error, questionCard, answerData.questionId);
    }
  }

  // Manejar respuesta exitosa
  handleAnswerSuccess(questionCard, answerData, result) {
    // Ocultar formulario
    this.hideAnswerForm(questionCard, answerData.questionId);

    // Actualizar contador de respuestas
    this.updateAnswerCount(questionCard);

    // Mostrar notificación de éxito
    this.showNotification("¡Respuesta enviada correctamente!", "success");

    // Opcional: Agregar la respuesta al DOM para mostrarla inmediatamente
    this.addAnswerToDOM(questionCard, {
      content: answerData.content,
      image: answerData.image, // <-- ¡Esto es clave!
      author: currentUser.username, // Podés usar currentUser.username si querés
      timestamp: new Date(),
      id: result.answerId,
    });
  }

  // Manejar error en envío
  handleAnswerError(error, questionCard, questionId) {
    this.hideLoadingInForm(questionCard, questionId);
    this.showNotification(
      "Error al enviar la respuesta. Intenta nuevamente.",
      "error"
    );
    console.error("Error enviando respuesta:", error);
  }

  // Mostrar loading en el formulario
  showLoadingInForm(questionCard, questionId) {
    const submitBtn = questionCard.querySelector(
      `#submit-answer-${questionId} button[type="submit"]`
    );
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }
  }

  // Ocultar loading en el formulario
  hideLoadingInForm(questionCard, questionId) {
    const submitBtn = questionCard.querySelector(
      `#submit-answer-${questionId} button[type="submit"]`
    );
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<i class="fas fa-paper-plane"></i> Enviar Respuesta';
    }
  }

  // Alternar visibilidad del formulario
  toggleAnswerForm(form) {
    if (form.style.display === "none") {
      form.style.display = "block";
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      form.style.display = "none";
    }
  }

  // Ocultar formulario de respuesta
  hideAnswerForm(questionCard, questionId) {
    const form = questionCard.querySelector(`#answer-form-${questionId}`);
    if (form) {
      form.style.animation = "slideUp 0.3s ease-out";
      setTimeout(() => {
        form.remove();
      }, 300);
    }
  }

  // Actualizar contador de respuestas
  updateAnswerCount(questionCard) {
    const statsElement = questionCard.querySelector(".question-stats span");
    if (statsElement && statsElement.textContent.includes("respuestas")) {
      const currentCount = parseInt(statsElement.textContent.match(/\d+/)[0]);
      statsElement.innerHTML = `<i class="fas fa-reply"></i> ${
        currentCount + 1
      } respuestas`;
    }
  }

  // Agregar respuesta al DOM (opcional, para feedback inmediato)
  addAnswerToDOM(questionCard, answerData) {
    const answersSection =
      questionCard.querySelector(".answers-section") ||
      this.createAnswersSection(questionCard);

    // Inicializar votos para esta respuesta
    this.answerVotes.set(answerData.id, {
      likes: 0,
      dislikes: 0,
      userVote: null,
    });

    const answerHTML = `
            <div class="answer-item" data-answer-id="${answerData.id}" style="
                background: #e8f5e8;
                border-left: 4px solid #00b894;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                animation: fadeIn 0.5s ease-out;
            ">
                <div class="answer-content" style="margin-bottom: 15px; line-height: 1.6;">
                  <p style="margin: 0 0 10px 0;">${answerData.content}</p>
                  ${
                    answerData.image
                      ? `<div class="answer-image-container"><img src="${answerData.image}" style="width: 100%; border-radius: 8px; margin-top: 5px;"></div>`
                      : ""
                  }
                </div>


                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="answer-meta" style="font-size: 12px; color: #636e72;">
                        <i class="fas fa-user"></i> ${answerData.author} • 
                        <i class="fas fa-clock"></i> Ahora mismo
                    </div>
                    
                    <div class="vote-buttons" style="display: flex; gap: 10px; align-items: center;">
                        <button class="vote-btn" data-answer-id="${
                          answerData.id
                        }" data-vote-type="like" style="
                            background: transparent;
                            border: 1px solid #ddd;
                            border-radius: 20px;
                            padding: 6px 12px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                            font-size: 12px;
                            color: #636e72;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.borderColor='#00b894'" onmouseout="this.style.borderColor='#ddd'">
                            <i class="fas fa-thumbs-up"></i>
                            <span class="like-count">0</span>
                        </button>
                        
                        <button class="vote-btn" data-answer-id="${
                          answerData.id
                        }" data-vote-type="dislike" style="
                            background: transparent;
                            border: 1px solid #ddd;
                            border-radius: 20px;
                            padding: 6px 12px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                            font-size: 12px;
                            color: #636e72;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.borderColor='#e17055'" onmouseout="this.style.borderColor='#ddd'">
                            <i class="fas fa-thumbs-down"></i>
                            <span class="dislike-count">0</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

    answersSection.insertAdjacentHTML("beforeend", answerHTML);
  }

  // Crear sección de respuestas si no existe
  createAnswersSection(questionCard) {
    const section = document.createElement("div");
    section.className = "answers-section";
    section.style.marginTop = "20px";
    section.innerHTML = '<h4><i class="fas fa-comments"></i> Respuestas</h4>';

    questionCard.appendChild(section);
    return section;
  }

  // Mostrar notificaciones
  showNotification(message, type = "success") {
    // Remover notificación existente
    const existing = document.querySelector(".notification-toast");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.className = "notification-toast";
    notification.innerHTML = `
            <i class="fas fa-${
              type === "success" ? "check-circle" : "exclamation-circle"
            }"></i>
            ${message}
        `;

    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#00b894" : "#e17055"};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
        `;

    document.body.appendChild(notification);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Crear modal de respuesta (alternativa al formulario inline)
  createResponseModal() {
    if (document.getElementById("response-modal")) return;

    const modalHTML = `
            <div class="modal" id="response-modal">
                <div class="modal-content">
                    <span class="close" id="response-modal-close">&times;</span>
                    <h2 id="response-modal-title">Responder Pregunta</h2>
                    <div id="response-question-preview"></div>
                    <form id="response-modal-form">
                        <textarea 
                            id="response-modal-content"
                            placeholder="Escribe tu respuesta detallada aquí..."
                            rows="8"
                            required
                        ></textarea>
                        <div class="file-upload">
                            <label for="response-image-upload">
                                <i class="fas fa-image"></i>
                                Subir imagen (opcional)
                            </label>
                            <input type="file" id="response-image-upload" accept="image/*" />
                        </div>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-paper-plane"></i>
                            Enviar Respuesta
                        </button>
                    </form>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.bindModalEvents();
  }

  // Vincular eventos del modal
  bindModalEvents() {
    const modal = document.getElementById("response-modal");
    const closeBtn = document.getElementById("response-modal-close");
    const form = document.getElementById("response-modal-form");

    // Cerrar modal
    closeBtn?.addEventListener("click", () => {
      modal.style.display = "none";
    });

    // Cerrar al hacer click fuera
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    // Manejar envío del formulario del modal
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      // Lógica similar a handleAnswerSubmit
    });
  }
}

// CSS adicional para animaciones
const additionalCSS = `
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(100%);
        }
    }

    .vote-btn.voted {
        font-weight: 600;
        border-width: 2px !important;
    }
    
    .vote-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .vote-btn:active {
        transform: translateY(0);
    }
`;

// Inyectar CSS adicional
const styleElement = document.createElement("style");
styleElement.textContent = additionalCSS;
document.head.appendChild(styleElement);

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.responderSystem = new ResponderSystem();
});

// Exportar para uso externo si es necesario
if (typeof module !== "undefined" && module.exports) {
  module.exports = ResponderSystem;
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('rsvpForm');
    const modal = document.getElementById('successModal');
    const confirmationMessage = document.getElementById('confirmationMessage');

    // Adiciona efeitos visuais aos inputs
    const inputs = document.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Adiciona animação aos radio buttons
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove seleção anterior
            radioOptions.forEach(opt => opt.classList.remove('selected'));
            // Adiciona seleção atual
            this.classList.add('selected');
            
            // Adiciona efeito visual
            const radioCustom = this.querySelector('.radio-custom');
            radioCustom.style.transform = 'scale(1.1)';
            setTimeout(() => {
                radioCustom.style.transform = 'scale(1)';
            }, 200);
        });
    });

    // Manipula o envio do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const nome = formData.get('nomeCompleto');
        const presenca = formData.get('presenca');
        const observacoes = formData.get('observacoes');

        // Validação
        if (!nome.trim()) {
            showError('Por favor, preencha seu nome completo.');
            return;
        }

        if (!presenca) {
            showError('Por favor, confirme se você estará presente.');
            return;
        }

        // Envia dados para o backend
        showLoading();
        
        // Prepara os dados para envio
        const dadosEnvio = {
            nomeCompleto: nome.trim(),
            presenca: presenca,
            observacoes: observacoes ? observacoes.trim() : ''
        };

        // Faz a requisição para o backend
        fetch('/api/confirmar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosEnvio)
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                showSuccessModal(nome, presenca, observacoes);
            } else {
                showError(data.error || 'Erro ao processar confirmação. Tente novamente.');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Erro:', error);
            showError('Erro de conexão. Verifique sua internet e tente novamente.');
        });
    });

    function showError(message) {
        // Cria uma notificação de erro temporária
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 300);
        }, 3000);
    }

    function showLoading() {
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="loading-spinner"></span>
            <span>Enviando...</span>
        `;
        
        // Adiciona CSS para o spinner
        if (!document.querySelector('#loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .loading-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function hideLoading() {
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <span class="btn-text">Confirmar Presença</span>
            <span class="btn-icon">🎈</span>
        `;
    }

    function showSuccessModal(nome, presenca, observacoes) {
        let message;
        
        if (presenca === 'sim') {
            message = `Obrigada, ${nome}! Sua presença foi confirmada com sucesso. Estamos ansiosas para celebrar os 30 anos da Andriely com você! 🎉`;
        } else {
            message = `Obrigada por nos informar, ${nome}. Sentiremos sua falta no Trintei da Andriely, mas esperamos vê-lo em breve! 💕`;
        }
        
        if (observacoes && observacoes.trim()) {
            message += `\n\nSua observação foi registrada: "${observacoes}"`;
        }
        
        confirmationMessage.textContent = message;
        modal.style.display = 'block';
        
        // Adiciona animação de entrada
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.transform = 'translate(-50%, -50%) scale(0.8)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modalContent.style.transition = 'all 0.3s ease';
            modalContent.style.transform = 'translate(-50%, -50%) scale(1)';
            modalContent.style.opacity = '1';
        }, 10);
    }

    function saveRSVP(nome, presenca, observacoes) {
        const rsvpData = {
            nome: nome,
            presenca: presenca,
            observacoes: observacoes,
            timestamp: new Date().toISOString()
        };
        
        // Salva no localStorage
        let rsvps = JSON.parse(localStorage.getItem('rsvps') || '[]');
        rsvps.push(rsvpData);
        localStorage.setItem('rsvps', JSON.stringify(rsvps));
        
        console.log('RSVP salvo:', rsvpData);
    }

    // Adiciona efeitos de hover nos elementos interativos
    const interactiveElements = document.querySelectorAll('.submit-btn, .radio-option, .form-input, .form-textarea');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Adiciona animação de entrada para os elementos
    const animatedElements = document.querySelectorAll('.header, .event-info, .rsvp-form, .important-note');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

function closeModal() {
    const modal = document.getElementById('successModal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.style.transition = 'all 0.3s ease';
    modalContent.style.transform = 'translate(-50%, -50%) scale(0.8)';
    modalContent.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
        
        // Reset do formulário
        document.getElementById('rsvpForm').reset();
        document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));
    }, 300);
}

// Adiciona funcionalidade de fechar modal clicando fora
document.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Adiciona funcionalidade de fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('successModal');
        if (modal.style.display === 'block') {
            closeModal();
        }
    }
});

// Função para visualizar RSVPs salvos (para demonstração)
function viewRSVPs() {
    const rsvps = JSON.parse(localStorage.getItem('rsvps') || '[]');
    console.log('RSVPs salvos:', rsvps);
    return rsvps;
}


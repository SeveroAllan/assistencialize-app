// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Skip if it's a download button (handled separately)
        if (this.classList.contains('btn-primary') || this.classList.contains('btn-cta') || this.classList.contains('btn-download')) {
            return;
        }

        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background on scroll
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        faqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards
document.querySelectorAll('.feature-card, .org-card, .elite-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

/* Download Dialog Logic */
const downloadDialog = document.getElementById('downloadDialog');
const closeDialogBtn = document.getElementById('closeDialog');
const emailForm = document.getElementById('emailForm');
const dialogForm = document.getElementById('dialogForm');
const dialogSuccess = document.getElementById('dialogSuccess');
const successMessage = document.getElementById('successMessage');

// Select all buttons that lead to download
const downloadButtons = document.querySelectorAll('.btn-download, .btn-primary, .btn-cta');

if (downloadDialog) {
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadDialog.classList.add('active');

            // Reset state
            dialogForm.style.display = 'block';
            dialogSuccess.style.display = 'none';
            emailForm.reset();
        });
    });

    // Close Dialog events
    closeDialogBtn.addEventListener('click', () => {
        downloadDialog.classList.remove('active');
    });

    downloadDialog.addEventListener('click', (e) => {
        if (e.target === downloadDialog) {
            downloadDialog.classList.remove('active');
        }
    });

    // Handle Form Submit
    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailForm.querySelector('input').value;
        const btnSubmit = emailForm.querySelector('.btn-submit');
        const originalText = btnSubmit.textContent;

        // Visual Feedback
        btnSubmit.textContent = 'Enviando...';
        btnSubmit.disabled = true;

        try {
            // Send to Webhook
            await fetch('https://hook.eu1.make.com/p14kpbv9r9ddhn00zhcbf1qlmp0rh6c4', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    source: 'landing_page',
                    date: new Date().toISOString()
                })
            });

            console.log('Email enviado com sucesso:', email);

            // Hide Form, Show Success
            dialogForm.style.display = 'none';
            dialogSuccess.style.display = 'block';

            // Check device type (Simple check)
            const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (!isMobile) {
                // Desktop: Start Download
                successMessage.textContent = 'O download começará automaticamente em instantes...';

                setTimeout(() => {
                    const link = document.createElement('a');
                    link.href = 'Assistencialize-Setup.exe';
                    link.download = 'Assistencialize-Setup.exe';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Close dialog after download starts
                    setTimeout(() => {
                        downloadDialog.classList.remove('active');
                    }, 4000);
                }, 1000);
            } else {
                // Mobile: Just show message
                successMessage.textContent = 'Enviamos o link de instalação para o seu e-mail. Acesse pelo computador para instalar o Assistencialize.';
            }

        } catch (error) {
            console.error('Erro ao enviar email:', error);
            alert('Houve um erro ao processar seu cadastro. Por favor, tente novamente.');
            btnSubmit.textContent = originalText;
            btnSubmit.disabled = false;
        }
    });
}

console.log('🚀 Assistencialize Landing Page carregada com sucesso!');

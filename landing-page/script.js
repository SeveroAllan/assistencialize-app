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

// Tracks which platform was selected (windows or mac)
let selectedPlatform = 'windows';

const DOWNLOAD_FILES = {
    windows: { file: 'Assistencialize-Setup.exe', label: 'Assistencialize-Setup.exe' },
    mac: { file: 'Assistencialize-Setup-mac.dmg', label: 'Assistencialize-Setup-mac.dmg' }
};

// Select all buttons that open the download dialog
const downloadTriggers = document.querySelectorAll('.open-download-dialog, .btn-primary, .btn-cta');

if (downloadDialog) {
    downloadTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectedPlatform = btn.dataset.platform || 'windows';
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    platform: selectedPlatform,
                    source: 'landing_page',
                    date: new Date().toISOString()
                })
            });

            // Hide Form, Show Success
            dialogForm.style.display = 'none';
            dialogSuccess.style.display = 'block';

            const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (!isMobile) {
                successMessage.textContent = 'Redirecionando para a página de instalação...';
                setTimeout(() => {
                    window.location.href = `obrigado.html?platform=${selectedPlatform}`;
                }, 1200);
            } else {
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

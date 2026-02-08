
const { supabase } = require('../../config/supabase.js');

const loginTemplate = `
<div id="login-overlay" class="login-overlay hidden">
    <div class="login-container">
        <h1 class="login-title">Faça o login</h1>
        <p class="login-subtitle">Acesse sua conta para gerenciar seus perfis.</p>
        
        <form id="login-form" class="login-form">
            <div class="input-group">
                <input type="email" id="email-input" placeholder="E-mail" required />
            </div>
            
            <div class="input-group password-group">
                <input type="password" id="password-input" placeholder="Senha" required />
                <button type="button" class="toggle-password" id="toggle-password">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </div>
            
            <div class="forgot-password">
                <a href="#">Esqueci a minha senha</a>
            </div>
            
            <button type="submit" class="LoginButton">Entrar agora</button>
            
            <div class="divider">
                <span>ou</span>
            </div>
            
            <button type="button" class="google-btn">
                <svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.341,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.341,43.611,20.083z"/>
                </svg>
                Entrar com Google
            </button>
            
            <div class="signup-link">
                Não tem uma conta? <a href="#">Criar agora</a>
            </div>
        </form>
    </div>
</div>
`;

function initAuth() {
    // Inject login template
    if (!document.getElementById('login-overlay')) {
        document.body.insertAdjacentHTML('beforeend', loginTemplate);
    }

    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');

    // Check session
    checkSession(loginOverlay);

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        // Update icon (optional, simplistic for now)
        if (type === 'text') {
            togglePasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
            togglePasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
    });

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;

        submitBtn.textContent = 'Entrando...';
        submitBtn.disabled = true;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Success
            loginOverlay.classList.add('hidden');
        } catch (error) {
            alert('Erro ao fazer login: ' + error.message);
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

async function checkSession(overlay) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        overlay.classList.add('hidden');
    } else {
        overlay.classList.remove('hidden');
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            overlay.classList.add('hidden');
        } else {
            overlay.classList.remove('hidden');
        }
    });
}

module.exports = { initAuth };

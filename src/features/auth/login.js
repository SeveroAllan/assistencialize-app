
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
                Não tem uma conta? <a href="#" id="show-signup">Criar agora</a>
            </div>
        </form>
    </div>
</div>
`;

const signupTemplate = `
<div id="signup-overlay" class="login-overlay hidden">
    <div class="login-container">
        <h1 class="login-title">Criar conta</h1>
        <p class="login-subtitle">Cadastre-se gratuitamente e comece a usar agora.</p>
        
        <form id="signup-form" class="login-form">
            <div class="input-group">
                <input type="email" id="signup-email-input" placeholder="E-mail" required />
            </div>
            
            <div class="input-group password-group">
                <input type="password" id="signup-password-input" placeholder="Senha" required minlength="6" />
                <button type="button" class="toggle-password" id="toggle-signup-password">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </div>
            
            <div class="input-group password-group">
                <input type="password" id="signup-confirm-password-input" placeholder="Confirmar senha" required minlength="6" />
                <button type="button" class="toggle-password" id="toggle-signup-confirm-password">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </div>
            
            <button type="submit" class="LoginButton">Criar conta</button>
            
            <div class="divider">
                <span>ou</span>
            </div>
            
            <button type="button" class="google-btn" id="signup-google-btn">
                <svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.341,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.341,43.611,20.083z"/>
                </svg>
                Cadastrar com Google
            </button>
            
            <div class="signup-link">
                Já tem uma conta? <a href="#" id="show-login">Fazer login</a>
            </div>
        </form>
    </div>
</div>
`;


function initAuth() {
    // Inject login and signup templates
    if (!document.getElementById('login-overlay')) {
        document.body.insertAdjacentHTML('beforeend', loginTemplate);
    }
    if (!document.getElementById('signup-overlay')) {
        document.body.insertAdjacentHTML('beforeend', signupTemplate);
    }

    const loginOverlay = document.getElementById('login-overlay');
    const signupOverlay = document.getElementById('signup-overlay');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');

    // Signup elements
    const signupEmailInput = document.getElementById('signup-email-input');
    const signupPasswordInput = document.getElementById('signup-password-input');
    const signupConfirmPasswordInput = document.getElementById('signup-confirm-password-input');
    const toggleSignupPasswordBtn = document.getElementById('toggle-signup-password');
    const toggleSignupConfirmPasswordBtn = document.getElementById('toggle-signup-confirm-password');

    // Navigation links
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');

    // Check session
    checkSession(loginOverlay, signupOverlay);

    // Navigation between login and signup
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginOverlay.classList.add('hidden');
        signupOverlay.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupOverlay.classList.add('hidden');
        loginOverlay.classList.remove('hidden');
    });

    // Toggle password visibility - Login
    togglePasswordBtn.addEventListener('click', () => {
        togglePasswordVisibility(passwordInput, togglePasswordBtn);
    });

    // Toggle password visibility - Signup
    toggleSignupPasswordBtn.addEventListener('click', () => {
        togglePasswordVisibility(signupPasswordInput, toggleSignupPasswordBtn);
    });

    toggleSignupConfirmPasswordBtn.addEventListener('click', () => {
        togglePasswordVisibility(signupConfirmPasswordInput, toggleSignupConfirmPasswordBtn);
    });

    // Handle Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;

        // Immediate visual feedback
        submitBtn.textContent = 'Entrando...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.style.opacity = '0.7';
        submitBtn.style.cursor = 'not-allowed';

        // Use requestAnimationFrame to ensure UI updates are rendered
        requestAnimationFrame(async () => {
            const email = emailInput.value;
            const password = passwordInput.value;

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
                submitBtn.classList.remove('loading');
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        });
    });

    // Handle Signup
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;

        const email = signupEmailInput.value;
        const password = signupPasswordInput.value;
        const confirmPassword = signupConfirmPasswordInput.value;

        // Validate passwords match
        if (password !== confirmPassword) {
            alert('As senhas não coincidem. Por favor, verifique.');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        // Immediate visual feedback
        submitBtn.textContent = 'Criando conta...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.style.opacity = '0.7';
        submitBtn.style.cursor = 'not-allowed';

        // Use requestAnimationFrame to ensure UI updates are rendered
        requestAnimationFrame(async () => {
            try {
                // Create user in Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (authError) throw authError;

                if (!authData.user) {
                    throw new Error('Erro ao criar usuário.');
                }

                // Get Free plan ID
                const { data: freePlan, error: planError } = await supabase
                    .from('plans')
                    .select('id')
                    .eq('name', 'Free')
                    .single();

                if (planError) {
                    console.error('Erro ao buscar plano Free:', planError);
                    // Continue anyway, user is created
                }

                // Create subscription for the user with Free plan
                if (freePlan) {
                    const { error: subscriptionError } = await supabase
                        .from('subscriptions')
                        .insert({
                            user_id: authData.user.id,
                            plan_id: freePlan.id,
                            status: 'active',
                            start_date: new Date().toISOString(),
                        });

                    if (subscriptionError) {
                        console.error('Erro ao criar assinatura:', subscriptionError);
                    }
                }

                // Success - show login screen
                alert('Conta criada com sucesso! Faça login para continuar.');
                signupOverlay.classList.add('hidden');
                loginOverlay.classList.remove('hidden');

                // Pre-fill email in login form
                emailInput.value = email;
                passwordInput.focus();

            } catch (error) {
                alert('Erro ao criar conta: ' + error.message);
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        });
    });
}

function togglePasswordVisibility(input, button) {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);

    if (type === 'text') {
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    } else {
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }
}

async function checkSession(loginOverlay, signupOverlay) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        loginOverlay.classList.add('hidden');
        signupOverlay.classList.add('hidden');
    } else {
        loginOverlay.classList.remove('hidden');
        signupOverlay.classList.add('hidden');
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            loginOverlay.classList.add('hidden');
            signupOverlay.classList.add('hidden');
        } else {
            loginOverlay.classList.remove('hidden');
            signupOverlay.classList.add('hidden');
        }
    });
}

module.exports = { initAuth };

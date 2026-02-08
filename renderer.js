// CÓDIGO ROBUSTO E SIMPLIFICADO para renderer.js

const { ipcRenderer } = require('electron');
const remote = require('@electron/remote');
const { Menu, MenuItem } = remote;
const { initAuth } = require('./src/features/auth/login.js');
const { supabase } = require('./src/config/supabase.js');
const { fetchInstances: apiFetchInstances, createInstance: apiCreateInstance, updateInstanceName: apiUpdateInstanceName, deleteInstance: apiDeleteInstance } = require('./src/features/instances/instances.service.js');



document.addEventListener('DOMContentLoaded', () => {
    const instancesList = document.querySelector('.instances-list');
    const webviewContainer = document.querySelector('.webview-container');
    const addInstanceBtn = document.getElementById('add-instance-btn');
    const headerAddBtn = document.getElementById('header-add-btn');
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');

    // Init Auth
    initAuth();

    // Account Dropdown Logic
    const accountBtn = document.getElementById('account-btn');
    const accountDropdown = document.getElementById('account-dropdown');

    if (accountBtn && accountDropdown) {
        accountBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            accountDropdown.classList.toggle('hidden');
            accountBtn.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!accountBtn.contains(e.target) && !accountDropdown.contains(e.target)) {
                accountDropdown.classList.add('hidden');
                accountBtn.classList.remove('active');
            }
        });

        // Logout Logic
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                const { supabase } = require('./src/config/supabase.js');
                await supabase.auth.signOut();
                // Auth state change will handle the overlay
            });
        }
    }

    // Initialize user email and listen for changes


    const updateEmail = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const emailEl = document.getElementById('user-email');
        if (emailEl) {
            if (session && session.user) {
                emailEl.innerText = session.user.email;
            } else {
                emailEl.innerText = 'Não conectado';
            }
        }
    };

    updateEmail();

    supabase.auth.onAuthStateChange((event, session) => {
        const emailEl = document.getElementById('user-email');
        const welcomeBtn = document.getElementById('welcome-btn');

        if (emailEl) {
            if (session && session.user) {
                emailEl.innerText = session.user.email;
            } else {
                emailEl.innerText = 'Não conectado';
            }
        }

        // Reset Welcome Button if logged out
        if (!session && welcomeBtn) {
            welcomeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path
                        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z">
                    </path>
                </svg>
                <span>Bem vinda</span>`;
            welcomeBtn.setAttribute('title', 'Bem vinda');
        }
    });

    // Lógica dos botões da janela
    if (headerAddBtn) headerAddBtn.addEventListener('click', addInstance);
    // Configurações removidas
    minimizeBtn.addEventListener('click', () => ipcRenderer.send('minimize-app'));
    maximizeBtn.addEventListener('click', () => ipcRenderer.send('maximize-app'));
    closeBtn.addEventListener('click', () => ipcRenderer.send('close-app'));

    // --- Sistema de Gerenciamento de Instâncias ---
    let instances = [];


    function activateInstance(instanceId) {
        document.querySelectorAll('.webview-content').forEach(view => view.classList.remove('active'));
        document.querySelectorAll('.instance-button').forEach(btn => btn.classList.remove('active'));
        const webview = document.getElementById(instanceId);
        const button = document.querySelector(`[data-instance-id="${instanceId}"]`);

        const welcomeBtn = document.getElementById('welcome-btn');

        if (webview && button) {
            webview.classList.add('active');
            button.classList.add('active');
            button.classList.remove('unread');

            // Update Header Button
            const instanceName = button.querySelector('.profile-name').textContent;
            // Determine label based on instance name or default to generic WhatsApp
            // User requested "WhatsApp" or "WhatsApp Business".
            // Since we can't easily detect Business vs Regular via name unless user sets it,
            // we will use "WhatsApp" generally, or the instance Name if custom.
            // However, to strictly follow "deve-se estar escrito 'WhatsApp'...", let's use "WhatsApp" as the base label, 
            // or perhaps appending "Business" if the name suggests it. 
            // For now, let's use the instance name which defaults to "WhatsApp X".

            // To be safe with "WhatsApp" or "WhatsApp Business", let's check if the name contains "Business".
            let displayText = "WhatsApp";
            if (instanceName.toLowerCase().includes('business')) {
                displayText = "WhatsApp Business";
            } else if (instanceName.toLowerCase().includes('whatsapp')) {
                // Use the full name if it's like "WhatsApp 1", "WhatsApp 2" to differentiate?
                // User request says: "deve-se estar escrito 'WhatsApp' ou WhatsApp Business'".
                // It implies switching between these two standard titles.
                // But wait, if I have 2 instances, how do I know which is which in the header?
                // Maybe the user wants the header to reflect the "App" being used.
                displayText = "WhatsApp";
            } else {
                // Fallback to instance name if it's completely custom?
                displayText = instanceName;
            }

            if (welcomeBtn) {
                welcomeBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="css-i6dzq1">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>${displayText}</span>`;
            }
        }
    }

    function createInstanceUI(instance) {
        const { id, name } = instance;

        const button = document.createElement('button');
        button.className = 'instance-button';
        button.setAttribute('data-instance-id', id);
        button.innerHTML = `
            <svg class="instance-whatsapp-icon" viewBox="0 0 24 24" width="20" height="20" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span class="profile-name">${name}</span>
            <input type="text" class="profile-name-input" style="display: none;" value="${name}">
            <button class="instance-menu-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
        `;

        button.onclick = (e) => {
            if (e.target.closest('.instance-menu-btn') || e.target.classList.contains('profile-name-input')) return;
            activateInstance(id);
        };
        instancesList.appendChild(button);

        const webview = document.createElement('webview');
        webview.id = id;
        webview.className = 'webview-content';
        webview.src = 'https://web.whatsapp.com/';
        // Use database UUID for partition to ensure persistence across sessions/devices if possible, 
        // though partition is local to the electron app data. Using UUID is fine.
        webview.partition = `persist:${id}`;
        webview.useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
        webview.setAttribute('allowpopups', 'true');

        webviewContainer.appendChild(webview);

        const menuBtn = button.querySelector('.instance-menu-btn');
        const profileNameSpan = button.querySelector('.profile-name');
        const profileNameInput = button.querySelector('.profile-name-input');

        const saveName = async () => {
            const newName = profileNameInput.value.trim();
            if (newName && newName !== name) {
                const updated = await apiUpdateInstanceName(id, newName);
                if (updated) {
                    profileNameSpan.textContent = newName;
                    const instanceIndex = instances.findIndex(inst => inst.id === id);
                    if (instanceIndex > -1) {
                        instances[instanceIndex].name = newName;
                    }
                } else {
                    alert('Erro ao renomear instância. Verifique sua conexão.');
                    profileNameInput.value = name;
                }
            }
            profileNameInput.style.display = 'none';
            profileNameSpan.style.display = 'block';
        };

        menuBtn.addEventListener('click', () => {
            const menu = new Menu();
            menu.append(new MenuItem({
                label: 'Editar Nome',
                click: () => {
                    profileNameSpan.style.display = 'none';
                    profileNameInput.style.display = 'block';
                    profileNameInput.value = profileNameSpan.textContent;
                    profileNameInput.focus();
                    profileNameInput.select();
                }
            }));
            menu.append(new MenuItem({
                label: 'Excluir Instância',
                click: async () => {
                    if (confirm(`Tem certeza que deseja excluir a instância "${profileNameSpan.textContent}"?`)) {
                        const deleted = await apiDeleteInstance(id);
                        if (deleted) {
                            instances = instances.filter(inst => inst.id !== id);
                            button.remove();
                            webview.remove();
                            if (instances.length > 0) {
                                activateInstance(instances[0].id);
                            } else {
                                // Empty state handled by not activating anything
                            }
                        } else {
                            alert('Erro ao excluir instância do banco de dados.');
                        }
                    }
                }
            }));
            menu.popup({ window: remote.getCurrentWindow() });
        });

        profileNameInput.addEventListener('blur', saveName);
        profileNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName(); });

        webview.addEventListener('page-title-updated', (event) => {
            if (event.title.includes('(') && !button.classList.contains('active')) {
                button.classList.add('unread');
            }
        });
    }

    async function addInstance() {
        const { data: { session } } = await supabase.auth.getSession();

        console.log('addInstance called, session:', session);

        if (!session || !session.user) {
            console.error('No active session found');
            alert('Você precisa estar logado para adicionar novas instâncias.');
            return;
        }

        console.log('User ID:', session.user.id);

        const { checkInstanceLimit } = require('./src/features/subscription/subscription.service.js');
        const limitCheck = await checkInstanceLimit(session.user.id, instances.length);

        console.log('Limit check result:', limitCheck);

        if (!limitCheck.allowed) {
            alert(limitCheck.message);
            return;
        }

        const name = `WhatsApp ${instances.length + 1}`;
        console.log('Attempting to create instance with name:', name);

        try {
            const newInstance = await apiCreateInstance(session.user.id, name);
            if (newInstance) {
                console.log('Instance created, adding to UI:', newInstance);
                instances.push(newInstance);
                createInstanceUI(newInstance);
                activateInstance(newInstance.id);
            }
        } catch (err) {
            console.error('Failed to create instance:', err);
            alert('Erro ao criar instância: ' + err.message);
        }
    }

    let isLoadingInstances = false;

    async function loadInstances() {
        if (isLoadingInstances) {
            console.log('loadInstances already in progress, skipping...');
            return;
        }

        isLoadingInstances = true;
        console.log('loadInstances: Starting...');
        const { data: { session } } = await supabase.auth.getSession();

        // Clear current UI first
        instancesList.innerHTML = '';
        webviewContainer.innerHTML = '';
        instances = [];

        if (session && session.user) {
            try {
                console.log('Fetching instances for user:', session.user.id);
                const fetchedInstances = await apiFetchInstances(session.user.id);
                instances = fetchedInstances || [];
                console.log('Fetched instances:', instances.length);

                if (instances.length > 0) {
                    instances.forEach(instance => {
                        console.log('Creating UI for instance:', instance.id, instance.name);
                        createInstanceUI(instance);
                    });
                    activateInstance(instances[0].id);
                } else {
                    console.log('No instances found');
                }
            } catch (err) {
                console.error('Failed to load instances', err);
            }
        } else {
            console.log('No active session');
        }

        isLoadingInstances = false;
        console.log('loadInstances: Complete');
    }

    // Refresh instances on Auth Change
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN') {
            // Only reload when user explicitly signs in
            loadInstances();
        } else if (event === 'SIGNED_OUT') {
            instancesList.innerHTML = '';
            webviewContainer.innerHTML = '';
            instances = [];
        }
        // Ignore INITIAL_SESSION and TOKEN_REFRESHED to avoid duplicate loads
    });

    addInstanceBtn.addEventListener('click', addInstance);
    // Initial Load
    loadInstances();
});

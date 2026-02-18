const { ipcRenderer, shell } = require('electron');
const remote = require('@electron/remote');
const { Menu, MenuItem } = remote;
const { initAuth } = require('./src/features/auth/login.js');
const { supabase } = require('./src/config/supabase.js');
const { fetchInstances: apiFetchInstances, createInstance: apiCreateInstance, updateInstanceName: apiUpdateInstanceName, deleteInstance: apiDeleteInstance, fetchFolders: apiFetchFolders, createFolder: apiCreateFolder, deleteFolder: apiDeleteFolder, updateInstanceFolder: apiUpdateInstanceFolder, updateFolderName: apiUpdateFolderName } = require('./src/features/instances/instances.service.js');
const { checkInstanceLimit } = require('./src/features/subscription/subscription.service.js');

// Detecta plataforma e aplica classe no body para adaptar o CSS
ipcRenderer.on('platform-info', (event, { isMac }) => {
    if (isMac) {
        document.body.classList.add('is-mac');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const instancesList = document.querySelector('.instances-list');
    const webviewContainer = document.querySelector('.webview-container');
    const addInstanceBtn = document.getElementById('add-instance-btn');
    const addFolderBtn = document.getElementById('add-folder-btn');
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
                await supabase.auth.signOut();
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
    minimizeBtn.addEventListener('click', () => ipcRenderer.send('minimize-app'));
    maximizeBtn.addEventListener('click', () => ipcRenderer.send('maximize-app'));
    closeBtn.addEventListener('click', () => ipcRenderer.send('close-app'));

    // --- Sistema de Gerenciamento de Instâncias ---
    let instances = [];
    let folders = [];

    function activateInstance(instanceId) {
        // Deactivate all tabs
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

        // Deactivate all instance containers
        document.querySelectorAll('.instance-container').forEach(container => {
            container.classList.remove('active');
        });

        // Deactivate all sidebar buttons
        document.querySelectorAll('.instance-button').forEach(btn => btn.classList.remove('active'));

        // Activate selected instance tab
        const tabEl = document.querySelector(`.tab[data-tab-id="${instanceId}"]`);
        if (tabEl) tabEl.classList.add('active');

        // Activate instance container
        const containerEl = document.getElementById(`instance-container-${instanceId}`);
        if (containerEl) containerEl.classList.add('active');

        // Activate sidebar button
        const button = document.querySelector(`[data-instance-id="${instanceId}"]`);
        if (button) {
            button.classList.add('active');
            button.classList.remove('unread');
            const dot = button.querySelector('.notification-dot');
            if (dot) dot.style.display = 'none';
        }

        // Update welcome button
        const welcomeBtn = document.getElementById('welcome-btn');
        if (button && welcomeBtn) {
            const instanceName = button.querySelector('.profile-name').textContent;
            let displayText = "WhatsApp";
            if (instanceName.toLowerCase().includes('business')) {
                displayText = "WhatsApp Business";
            } else if (instanceName.toLowerCase().includes('whatsapp')) {
                displayText = "WhatsApp";
            } else {
                displayText = instanceName;
            }

            welcomeBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="css-i6dzq1">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>${displayText}</span>`;
        }
    }

    function createInstanceUI(instance, index, parentContainer = instancesList, isLocked = false) {
        const { id, name, folder_id } = instance;
        const initialText = `W${index + 1}`;

        const button = document.createElement('button');
        button.className = 'instance-button';
        button.className = 'instance-button';
        button.setAttribute('data-instance-id', id);
        button.title = name; // Tooltip nativo para quando a sidebar estiver fechada
        button.innerHTML = `
            <div class="avatar-placeholder">
                <span class="avatar-text">${initialText}</span>
                <div class="notification-dot" style="display: none;"></div>
            </div>
            <span class="profile-name">${name}</span>
            <svg class="instance-whatsapp-icon" viewBox="0 0 24 24" width="20" height="20" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <input type="text" class="profile-name-input" style="display: none;" value="${name}">
            <button class="instance-menu-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
        `;

        button.onclick = (e) => {
            if (e.target.closest('.instance-menu-btn') || e.target.classList.contains('profile-name-input')) return;
            if (window.activateInstance) window.activateInstance(id);
            else activateInstance(id);
        };
        parentContainer.appendChild(button);

        // Create instance container (sub-tabs will be in header, not here)
        const containerEl = document.createElement('div');
        containerEl.className = 'instance-container';
        containerEl.id = `instance-container-${id}`;
        containerEl.setAttribute('data-instance-name', name);
        containerEl.innerHTML = `
            <div class="sub-webviews-container" id="sub-webviews-${id}">
                <!-- Sub-webviews will be added here -->
            </div>
        `;
        webviewContainer.appendChild(containerEl);

        const webview = document.createElement('webview');
        webview.id = id;
        webview.className = 'sub-webview active';
        webview.style.display = 'flex'; // Ensure initial visibility
        webview.src = 'https://web.whatsapp.com/';
        webview.partition = `persist:${id}`;
        webview.useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
        webview.setAttribute('allowpopups', 'true');

        // Add WhatsApp webview to sub-webviews container
        const subWebviewsContainer = document.getElementById(`sub-webviews-${id}`);
        subWebviewsContainer.appendChild(webview);

        // Create WhatsApp tab element (fixed, not closeable) - will be added to header by navigation-tabs.js
        const whatsappTabEl = document.createElement('div');
        whatsappTabEl.className = 'sub-tab';
        whatsappTabEl.setAttribute('data-tab-id', `whatsapp-${id}`);
        whatsappTabEl.setAttribute('data-instance-id', id);
        whatsappTabEl.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>WhatsApp</span>
        `;
        whatsappTabEl.onclick = () => window.switchNavigationTab && window.switchNavigationTab(id, `whatsapp-${id}`);

        // Store tab element reference in container for navigation-tabs.js to use
        containerEl._whatsappTabElement = whatsappTabEl;
        containerEl._whatsappWebview = webview;

        // If locked, create overlay
        if (isLocked) {
            const overlay = document.createElement('div');
            overlay.id = `overlay-${id}`;
            overlay.className = 'upgrade-overlay';
            overlay.innerHTML = `
                <div class="upgrade-dialog">
                    <h2>Você atingiu o limite de WhatsApp conectado</h2>
                    <p>Faça o upgrade para remover os limites e conectar mais instâncias.</p>
                    <a href="#" class="upgrade-btn">Quero contratar um plano do Assistencialize.</a>
                </div>
            `;

            const link = overlay.querySelector('.upgrade-btn');
            link.onclick = (e) => {
                e.preventDefault();
                shell.openExternal('https://wa.me/555193527271?text=Quero%20contratar%20um%20plano%20do%20Assistencialize.');
            };

            webviewContainer.appendChild(overlay);
        }

        const menuBtn = button.querySelector('.instance-menu-btn');
        const profileNameSpan = button.querySelector('.profile-name');
        const profileNameInput = button.querySelector('.profile-name-input');
        const notificationDot = button.querySelector('.notification-dot');

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
                label: 'Mover para Pasta',
                submenu: [
                    {
                        label: 'Nenhuma (Raiz)',
                        click: async () => {
                            await apiUpdateInstanceFolder(id, null);
                            loadInstances();
                        }
                    },
                    ...folders.map(folder => ({
                        label: folder.name,
                        click: async () => {
                            await apiUpdateInstanceFolder(id, folder.id);
                            loadInstances();
                        }
                    }))
                ]
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
                            const ov = document.getElementById(`overlay-${id}`);
                            if (ov) ov.remove();

                            if (instances.length > 0) {
                                activateInstance(instances[0].id);
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
                if (notificationDot) notificationDot.style.display = 'block';
            }
        });
    }

    async function addInstance() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
            alert('Você precisa estar logado para adicionar novas instâncias.');
            return;
        }

        const name = `WhatsApp ${instances.length + 1}`;
        try {
            const newInstance = await apiCreateInstance(session.user.id, name);
            if (newInstance) {
                instances.push(newInstance);
                loadInstances();
            }
        } catch (err) {
            console.error('Failed to create instance:', err);
            alert('Erro ao criar instância: ' + err.message);
        }
    }

    function createFolderUI(folder, folderInstances = []) {
        // Avatars Logic
        let avatarsHtml = '';
        const total = folderInstances.length;

        if (total > 0) {
            avatarsHtml = '<div class="folder-avatars">';

            // First avatar (always if > 0)
            const first = folderInstances[0];
            // Use ui-avatars logic similar to instance creation (or placeholder if needed)
            const firstName = first.name || 'User';
            const firstImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=random&color=fff&rounded=true&size=32`;

            avatarsHtml += `<div class="folder-avatar-circle" style="z-index: 2;"><img src="${firstImg}" alt="${firstName}"></div>`;

            if (total > 1) {
                if (total === 2) {
                    // Show second avatar
                    const second = folderInstances[1];
                    const secondName = second.name || 'User';
                    const secondImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(secondName)}&background=random&color=fff&rounded=true&size=32`;
                    avatarsHtml += `<div class="folder-avatar-circle" style="z-index: 1;"><img src="${secondImg}" alt="${secondName}"></div>`;
                } else {
                    // Show counter for remaining (total - 1 shown)
                    // Requirement: "um avatar e no sobreposto o texto +quantidade de instâncias restante"
                    // If total > 2, e.g. 3: Show 1 avatar + counter "+2"
                    // Wait, user said: "quando tiver + de 2 instâncias fica um avatar e no sobreposto o texto +quantidade de instâncias restante na pasta"
                    // E.g. Total 3: [Avatar1] [+2 remaining]
                    const remaining = total - 1;
                    avatarsHtml += `<div class="folder-avatar-circle folder-counter" style="z-index: 1;">+${remaining}</div>`;
                }
            }
            avatarsHtml += '</div>';
        }

        const folderGroup = document.createElement('div');
        folderGroup.className = 'folder-group'; // Add initial state if needed

        folderGroup.innerHTML = `
            <div class="folder-header">
                <div class="folder-left">
                    <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span class="folder-name">${folder.name}</span>
                </div>
                
                <div class="folder-right">
                    ${avatarsHtml}
                    <div class="folder-arrow-wrapper">
                        <svg class="folder-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>

                <button class="folder-actions-btn" title="Opções da Pasta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
            </div>
            <div class="folder-content" id="folder-content-${folder.id}"></div>
        `;

        const header = folderGroup.querySelector('.folder-header');
        header.onclick = (e) => {
            if (e.target.closest('.folder-actions-btn')) return;
            folderGroup.classList.toggle('open');
        };

        const actionsBtn = folderGroup.querySelector('.folder-actions-btn');
        actionsBtn.onclick = (e) => {
            e.stopPropagation();
            const menu = new Menu();

            menu.append(new MenuItem({
                label: 'Renomear',
                click: () => {
                    const newName = prompt('Novo nome para a pasta:', folder.name);
                    if (newName && newName.trim() !== '' && newName !== folder.name) {
                        apiUpdateFolderName(folder.id, newName.trim())
                            .then((success) => {
                                if (success) loadInstances();
                                else alert('Erro ao renomear pasta.');
                            })
                            .catch(err => alert('Erro: ' + err.message));
                    }
                }
            }));

            menu.append(new MenuItem({ type: 'separator' }));

            menu.append(new MenuItem({
                label: 'Excluir Pasta',
                click: async () => {
                    if (confirm(`Tem certeza que deseja excluir a pasta "${folder.name}"? As instâncias dentro dela voltarão para a raiz.`)) {
                        const folderInstances = instances.filter(i => i.folder_id === folder.id);
                        for (const inst of folderInstances) {
                            await apiUpdateInstanceFolder(inst.id, null);
                        }
                        await apiDeleteFolder(folder.id);
                        loadInstances();
                    }
                }
            }));
            menu.popup({ window: remote.getCurrentWindow() });
        };

        instancesList.appendChild(folderGroup);
        return document.getElementById(`folder-content-${folder.id}`);
    }

    async function addFolder() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const modal = document.getElementById('folder-modal');
        const folderNameInput = document.getElementById('folder-name-input');
        const instancesChecklist = document.getElementById('instances-checklist');
        const saveFolderBtn = document.getElementById('save-folder-btn');
        const cancelFolderBtn = document.getElementById('cancel-folder-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const selectTrigger = document.getElementById('select-trigger');
        const selectWrapper = document.querySelector('.custom-select-wrapper');
        const customOptions = document.getElementById('custom-options');

        folderNameInput.value = '';
        instancesChecklist.innerHTML = '';
        selectTrigger.querySelector('span').textContent = 'Selecione...';
        selectWrapper.classList.remove('open');

        const rootInstances = instances.filter(inst => !inst.folder_id);

        if (rootInstances.length === 0) {
            instancesChecklist.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 10px;">Nenhum perfil disponível</p>';
        } else {
            rootInstances.forEach(inst => {
                const checkboxItem = document.createElement('div');
                checkboxItem.className = 'checkbox-item';
                checkboxItem.innerHTML = `
                    <input type="checkbox" id="inst-${inst.id}" value="${inst.id}">
                    <label for="inst-${inst.id}">${inst.name}</label>
                `;

                checkboxItem.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'INPUT') {
                        const cb = checkboxItem.querySelector('input');
                        cb.checked = !cb.checked;
                        updateSelectTrigger();
                    }
                });

                checkboxItem.querySelector('input').addEventListener('change', updateSelectTrigger);
                instancesChecklist.appendChild(checkboxItem);
            });
        }

        function updateSelectTrigger() {
            const count = instancesChecklist.querySelectorAll('input[type="checkbox"]:checked').length;
            const span = selectTrigger.querySelector('span');
            if (count === 0) {
                span.textContent = 'Selecione...';
            } else if (count === 1) {
                span.textContent = '1 perfil selecionado';
            } else {
                span.textContent = `${count} perfis selecionados`;
            }
        }

        selectTrigger.onclick = (e) => {
            e.stopPropagation();
            selectWrapper.classList.toggle('open');
            customOptions.classList.toggle('hidden');
        };

        const closeDropdown = (e) => {
            if (!selectWrapper.contains(e.target)) {
                selectWrapper.classList.remove('open');
                customOptions.classList.add('hidden');
            }
        };
        document.addEventListener('click', closeDropdown);

        modal.classList.remove('hidden');
        folderNameInput.focus();

        const closeModal = () => {
            modal.classList.add('hidden');
            selectWrapper.classList.remove('open');
            customOptions.classList.add('hidden');
            document.removeEventListener('click', closeDropdown);
        };

        closeModalBtn.onclick = closeModal;
        cancelFolderBtn.onclick = closeModal;

        const saveHandler = async () => {
            const folderName = folderNameInput.value.trim();
            if (!folderName) {
                alert('Por favor, insira um nome para a pasta.');
                return;
            }

            const selectedCheckboxes = instancesChecklist.querySelectorAll('input[type="checkbox"]:checked');
            const selectedInstanceIds = Array.from(selectedCheckboxes).map(cb => cb.value);

            const newFolder = await apiCreateFolder(session.user.id, folderName);

            if (newFolder) {
                for (const instId of selectedInstanceIds) {
                    await apiUpdateInstanceFolder(instId, newFolder.id);
                }

                loadInstances();
                closeModal();
            } else {
                alert('Erro ao criar pasta. Tente novamente.');
            }
        };

        saveFolderBtn.onclick = saveHandler;

        folderNameInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                saveHandler();
            }
        };
    }

    let isLoadingInstances = false;

    async function loadInstances() {
        if (isLoadingInstances) return;
        isLoadingInstances = true;
        const { data: { session } } = await supabase.auth.getSession();

        instancesList.innerHTML = '';
        webviewContainer.innerHTML = '';
        instances = [];
        folders = [];

        if (session && session.user) {
            try {
                const limitCheck = await checkInstanceLimit(session.user.id, 0);
                const maxInstances = limitCheck.maxDetails ? limitCheck.maxDetails.max : 2;

                const [fetchedInstances, fetchedFolders] = await Promise.all([
                    apiFetchInstances(session.user.id),
                    apiFetchFolders(session.user.id)
                ]);

                instances = fetchedInstances || [];
                folders = fetchedFolders || [];

                const folderMap = {};
                folders.forEach(folder => {
                    // Make sure instances are available here. They are loaded in fetchedInstances.
                    const folderInstances = instances.filter(i => i.folder_id === folder.id);
                    folderMap[folder.id] = createFolderUI(folder, folderInstances);
                });

                if (instances.length > 0) {
                    instances.forEach((instance, index) => {
                        let targetContainer = instancesList;
                        if (instance.folder_id && folderMap[instance.folder_id]) {
                            targetContainer = folderMap[instance.folder_id];
                        }

                        const isLocked = index >= maxInstances;
                        createInstanceUI(instance, index, targetContainer, isLocked);
                    });

                    if (instances.length > 0) {
                        // Atraso para garantir que navigation-tabs.js tenha sobrescrito a função activateInstance
                        setTimeout(() => {
                            activateInstance(instances[0].id);
                        }, 1000);
                    }
                }
            } catch (err) {
                console.error('Failed to load instances', err);
            }
        }
        isLoadingInstances = false;
    }

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            loadInstances();
        } else if (event === 'SIGNED_OUT') {
            instancesList.innerHTML = '';
            webviewContainer.innerHTML = '';
            instances = [];
        }
    });

    // --- Tabs System ---
    const tabsContainer = document.getElementById('tabs-container');
    const addNewTabBtn = document.getElementById('add-new-tab-btn');
    const profilesSidebar = document.getElementById('profiles-sidebar');
    const profilesWebviewContainer = document.getElementById('profiles-webview-container');
    const browserWebviewsContainer = document.getElementById('browser-webviews');

    let activeTabId = 'profiles';

    function switchTab(tabId) {
        // Deactivate current tab
        const currentTabEl = document.querySelector(`.tab[data-tab-id="${activeTabId}"]`);
        if (currentTabEl) currentTabEl.classList.remove('active');

        // Hide current content
        if (activeTabId === 'profiles') {
            if (profilesSidebar) profilesSidebar.style.display = 'none';
            if (profilesWebviewContainer) profilesWebviewContainer.style.display = 'none';
        } else {
            const browserWebview = document.getElementById(`browser-view-${activeTabId}`);
            if (browserWebview) browserWebview.style.display = 'none';
        }

        // Activate new tab
        activeTabId = tabId;
        const newTabEl = document.querySelector(`.tab[data-tab-id="${activeTabId}"]`);
        if (newTabEl) newTabEl.classList.add('active');

        // Show new content
        if (activeTabId === 'profiles') {
            if (profilesSidebar) profilesSidebar.style.display = 'flex';
            if (profilesWebviewContainer) profilesWebviewContainer.style.display = 'flex';
            if (browserWebviewsContainer) browserWebviewsContainer.style.display = 'none';
        } else {
            if (profilesSidebar) profilesSidebar.style.display = 'none';
            if (profilesWebviewContainer) profilesWebviewContainer.style.display = 'none';
            if (browserWebviewsContainer) browserWebviewsContainer.style.display = 'flex'; // Ensure container is visible

            const browserWebview = document.getElementById(`browser-view-${activeTabId}`);
            if (browserWebview) {
                browserWebview.style.display = 'flex';
            }
        }
    }

    // Expose switchTab globally so onclick in HTML works
    window.switchTab = switchTab;

    function createBrowserTab(url = 'https://www.google.com') {
        const tabId = 'tab-' + Date.now();
        const tabTitle = 'Nova guia';

        // Create Tab Element
        const tabEl = document.createElement('div');
        tabEl.className = 'tab';
        tabEl.setAttribute('data-tab-id', tabId);
        tabEl.innerHTML = `
            <svg class="tab-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>${tabTitle}</span>
            <button class="close-tab-btn" onclick="closeTab(event, '${tabId}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;

        tabEl.onclick = () => switchTab(tabId);

        // Insert before add button
        if (tabsContainer && addNewTabBtn) {
            tabsContainer.insertBefore(tabEl, addNewTabBtn);
        }

        // Create Webview
        const webview = document.createElement('webview');
        webview.id = `browser-view-${tabId}`;
        webview.src = url;
        webview.style.width = '100%';
        webview.style.height = '100%';
        webview.style.display = 'none'; // Hidden by default
        webview.setAttribute('allowpopups', 'true');

        // Title update listener
        webview.addEventListener('page-title-updated', (e) => {
            const titleSpan = tabEl.querySelector('span');
            if (titleSpan) titleSpan.textContent = e.title;
        });

        // Favicon update - usando dom-ready para garantir que a página carregou
        const updateFavicon = async () => {
            try {
                // Aguarda um pouco para garantir que o DOM está pronto
                await new Promise(resolve => setTimeout(resolve, 500));

                const faviconUrl = await webview.executeJavaScript(`
                    (function() {
                        const links = document.querySelectorAll('link[rel*="icon"]');
                        for (let link of links) {
                            if (link.href && link.href.startsWith('http')) {
                                return link.href;
                            }
                        }
                        // Fallback para favicon.ico
                        return window.location.origin + '/favicon.ico';
                    })();
                `);

                console.log('Favicon URL encontrada:', faviconUrl);

                if (faviconUrl) {
                    const existingIcon = tabEl.querySelector('.tab-icon') || tabEl.querySelector('.favicon');

                    if (existingIcon) {
                        if (existingIcon.tagName === 'IMG') {
                            existingIcon.src = faviconUrl;
                        } else {
                            const img = document.createElement('img');
                            img.className = 'tab-icon favicon';
                            img.src = faviconUrl;
                            img.style.width = '16px';
                            img.style.height = '16px';
                            img.onerror = () => {
                                console.log('Erro ao carregar favicon, voltando para ícone padrão');
                                if (img.parentNode) {
                                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                    svg.setAttribute('class', 'tab-icon');
                                    svg.setAttribute('width', '16');
                                    svg.setAttribute('height', '16');
                                    svg.setAttribute('viewBox', '0 0 24 24');
                                    svg.setAttribute('fill', 'none');
                                    svg.setAttribute('stroke', 'currentColor');
                                    svg.setAttribute('stroke-width', '2');
                                    svg.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>';
                                    img.parentNode.replaceChild(svg, img);
                                }
                            };
                            img.onload = () => {
                                console.log('Favicon carregado com sucesso!');
                            };
                            tabEl.replaceChild(img, existingIcon);
                        }
                    }
                }
            } catch (err) {
                console.log('Erro ao buscar favicon:', err);
            }
        };

        webview.addEventListener('dom-ready', updateFavicon);
        webview.addEventListener('did-navigate', updateFavicon);

        if (browserWebviewsContainer) {
            browserWebviewsContainer.appendChild(webview);
        }

        // Switch to new tab
        switchTab(tabId);
    }

    function closeTab(event, tabId) {
        event.stopPropagation(); // Prevent switching to tab when closing

        // Remove Tab Element
        const tabEl = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
        if (tabEl) tabEl.remove();

        // Remove Webview
        const webview = document.getElementById(`browser-view-${tabId}`);
        if (webview) webview.remove();

        // If closed tab was active, switch to profiles
        if (activeTabId === tabId) {
            switchTab('profiles');
        }
    }

    window.closeTab = closeTab; // Expose globally

    if (addNewTabBtn) {
        addNewTabBtn.addEventListener('click', () => {
            createBrowserTab();
        });
    }

    // --- Sub-tabs Management Functions ---
    window.createSubTab = function (instanceId, url = 'https://www.google.com') {
        const subTabId = `sub-${instanceId}-${Date.now()}`;
        const subTabsBar = document.getElementById(`sub-tabs-bar-${instanceId}`);
        const addBtn = subTabsBar.querySelector('.add-sub-tab-btn');

        // Create sub-tab element
        const subTabEl = document.createElement('div');
        subTabEl.className = 'sub-tab';
        subTabEl.setAttribute('data-sub-tab-id', subTabId);
        subTabEl.innerHTML = `
            <svg class="tab-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>Nova guia</span>
            <button class="close-sub-tab-btn" onclick="event.stopPropagation(); closeSubTab('${instanceId}', '${subTabId}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        subTabEl.onclick = () => window.switchSubTab(instanceId, subTabId);
        subTabsBar.insertBefore(subTabEl, addBtn);

        // Create webview
        const webview = document.createElement('webview');
        webview.id = `webview-${subTabId}`;
        webview.className = 'sub-webview';
        webview.src = url;
        webview.setAttribute('allowpopups', 'true');

        webview.addEventListener('page-title-updated', (e) => {
            const titleSpan = subTabEl.querySelector('span');
            if (titleSpan) titleSpan.textContent = e.title;
        });

        // Favicon update - usando dom-ready para garantir que a página carregou
        const updateSubTabFavicon = async () => {
            try {
                // Aguarda um pouco para garantir que o DOM está pronto
                await new Promise(resolve => setTimeout(resolve, 500));

                const faviconUrl = await webview.executeJavaScript(`
                    (function() {
                        const links = document.querySelectorAll('link[rel*="icon"]');
                        for (let link of links) {
                            if (link.href && link.href.startsWith('http')) {
                                return link.href;
                            }
                        }
                        // Fallback para favicon.ico
                        return window.location.origin + '/favicon.ico';
                    })();
                `);

                console.log('Sub-tab Favicon URL encontrada:', faviconUrl);

                if (faviconUrl) {
                    const existingIcon = subTabEl.querySelector('.tab-icon') || subTabEl.querySelector('.favicon');

                    if (existingIcon) {
                        if (existingIcon.tagName === 'IMG') {
                            existingIcon.src = faviconUrl;
                        } else {
                            const img = document.createElement('img');
                            img.className = 'tab-icon favicon';
                            img.src = faviconUrl;
                            img.style.width = '14px';
                            img.style.height = '14px';
                            img.onerror = () => {
                                console.log('Erro ao carregar favicon da sub-tab, voltando para ícone padrão');
                                if (img.parentNode) {
                                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                    svg.setAttribute('class', 'tab-icon');
                                    svg.setAttribute('width', '14');
                                    svg.setAttribute('height', '14');
                                    svg.setAttribute('viewBox', '0 0 24 24');
                                    svg.setAttribute('fill', 'none');
                                    svg.setAttribute('stroke', 'currentColor');
                                    svg.setAttribute('stroke-width', '2');
                                    svg.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>';
                                    img.parentNode.replaceChild(svg, img);
                                }
                            };
                            img.onload = () => {
                                console.log('Sub-tab favicon carregado com sucesso!');
                            };
                            subTabEl.replaceChild(img, existingIcon);
                        }
                    }
                }
            } catch (err) {
                console.log('Erro ao buscar favicon da sub-tab:', err);
            }
        };

        webview.addEventListener('dom-ready', updateSubTabFavicon);
        webview.addEventListener('did-navigate', updateSubTabFavicon);

        const subWebviewsContainer = document.getElementById(`sub-webviews-${instanceId}`);
        subWebviewsContainer.appendChild(webview);

        // Switch to new sub-tab
        window.switchSubTab(instanceId, subTabId);
    };

    window.switchSubTab = function (instanceId, subTabId) {
        const subTabsBar = document.getElementById(`sub-tabs-bar-${instanceId}`);
        if (!subTabsBar) return;

        // Deactivate all sub-tabs
        subTabsBar.querySelectorAll('.sub-tab').forEach(tab => tab.classList.remove('active'));

        // Hide all sub-webviews
        const subWebviewsContainer = document.getElementById(`sub-webviews-${instanceId}`);
        subWebviewsContainer.querySelectorAll('.sub-webview, .webview-content').forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none';
        });

        // Activate new sub-tab
        const newSubTab = subTabsBar.querySelector(`[data-sub-tab-id="${subTabId}"]`);
        if (newSubTab) newSubTab.classList.add('active');

        // Show corresponding webview
        if (subTabId.startsWith('whatsapp-')) {
            // Show WhatsApp webview
            const whatsappWebview = document.getElementById(instanceId);
            if (whatsappWebview) {
                whatsappWebview.classList.add('active');
                whatsappWebview.style.display = 'flex';
            }
        } else {
            // Show sub-tab webview
            const webview = document.getElementById(`webview-${subTabId}`);
            if (webview) {
                webview.classList.add('active');
                webview.style.display = 'flex';
            }
        }
    };

    window.closeSubTab = function (instanceId, subTabId) {
        const subTabsBar = document.getElementById(`sub-tabs-bar-${instanceId}`);
        const subTabEl = subTabsBar.querySelector(`[data-sub-tab-id="${subTabId}"]`);
        if (subTabEl) subTabEl.remove();

        const webview = document.getElementById(`webview-${subTabId}`);
        if (webview) webview.remove();

        // If closed tab was active, switch to WhatsApp
        const activeSubTab = subTabsBar.querySelector('.sub-tab.active');
        if (!activeSubTab) {
            window.switchSubTab(instanceId, `whatsapp-${instanceId}`);
        }
    };

    // Sidebar Toggle Logic
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const profilesSidebarEl = document.getElementById('profiles-sidebar');

    if (sidebarToggleBtn && profilesSidebarEl) {
        // Load saved state
        const savedState = localStorage.getItem('sidebar-collapsed');
        if (savedState === 'true') {
            profilesSidebarEl.classList.add('collapsed');
        }

        sidebarToggleBtn.addEventListener('click', () => {
            profilesSidebarEl.classList.toggle('collapsed');
            localStorage.setItem('sidebar-collapsed', profilesSidebarEl.classList.contains('collapsed'));
        });
    }

    addInstanceBtn.addEventListener('click', addInstance);
    if (addFolderBtn) addFolderBtn.addEventListener('click', addFolder);
    loadInstances();
});

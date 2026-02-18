// Navigation Tabs System - Shows tabs in header for active instance
console.log('[Navigation Tabs] Script loaded');

let activeInstanceId = null;
const instanceTabsData = {}; // Stores tabs for each instance
let originalActivateInstance = null;

// Wait for DOMContentLoaded to ensure we override AFTER renderer.js sets up its listeners and globals
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Navigation Tabs] DOMContentLoaded - initializing override');

    // We need to wait for renderer.js's DOMContentLoaded listener to run first
    // Since renderer.js is included before this script, its listener is registered first and runs first.
    // So by running in our own listener (registered second), we should see the globals it set.

    // Safety check: wait a tick
    setTimeout(() => {
        if (window.activateInstance) {
            console.log('[Navigation Tabs] Found original activateInstance, overriding...');
            originalActivateInstance = window.activateInstance;
            window.activateInstance = activateInstanceWithTabs;
            console.log('[Navigation Tabs] Override successful');
        } else {
            console.error('[Navigation Tabs] Original activateInstance NOT FOUND even after wait!');
            // Force override anyway to ensure functionality
            window.activateInstance = activateInstanceWithTabs;
        }
    }, 50);

    // Setup Navigation Controls
    setupNavigationControls();
});

function setupNavigationControls() {
    const backBtn = document.getElementById('nav-back');
    const forwardBtn = document.getElementById('nav-forward');
    const reloadBtn = document.getElementById('nav-reload');
    const homeBtn = document.getElementById('nav-home');
    const urlInput = document.getElementById('url-input');

    if (backBtn) backBtn.addEventListener('click', () => {
        const wv = getActiveWebview();
        if (wv && wv.canGoBack()) wv.goBack();
    });

    if (forwardBtn) forwardBtn.addEventListener('click', () => {
        const wv = getActiveWebview();
        if (wv && wv.canGoForward()) wv.goForward();
    });

    if (reloadBtn) reloadBtn.addEventListener('click', () => {
        const wv = getActiveWebview();
        if (wv) wv.reload();
    });

    if (homeBtn) homeBtn.addEventListener('click', () => {
        const wv = getActiveWebview();
        // If WhatsApp tab active, navigate main webview or do nothing? User said "Home para voltar para o google". Assuming navigation of current tab.
        if (wv) wv.loadURL('https://www.google.com');
    });

    if (urlInput) urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const wv = getActiveWebview();
            if (wv) {
                let url = urlInput.value.trim();
                if (!url.startsWith('http')) {
                    if (url.includes('.') && !url.includes(' ')) {
                        url = 'https://' + url;
                    } else {
                        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
                    }
                }
                wv.loadURL(url);
                urlInput.blur();
            }
        }
    });
}

function getActiveWebview() {
    if (!activeInstanceId || !instanceTabsData[activeInstanceId]) return null;
    const activeTab = instanceTabsData[activeInstanceId].find(t => t.tabEl.classList.contains('active'));
    return activeTab ? activeTab.webview : null;
}

function updateUrlBar() {
    const urlInput = document.getElementById('url-input');
    if (!urlInput) return;

    const webview = getActiveWebview();
    if (webview) {
        try {
            urlInput.value = webview.getURL();
        } catch (e) {
            // Webview might not be ready
        }
    } else {
        urlInput.value = '';
    }
}

function attachWebviewListeners(webview) {
    if (!webview || webview._listenersAttached) return;
    webview.addEventListener('did-navigate', updateUrlBar);
    webview.addEventListener('did-navigate-in-page', updateUrlBar);
    webview.addEventListener('dom-ready', updateUrlBar);
    webview._listenersAttached = true;
}

function activateInstanceWithTabs(instanceId) {
    console.log('[Navigation Tabs] Activating instance:', instanceId);

    // Use original function logic parts if needed, but we rewrite UI logic here to support header tabs

    // Hide all instance containers
    document.querySelectorAll('.instance-container').forEach(container => {
        container.classList.remove('active');
    });

    // Deactivate all sidebar buttons
    document.querySelectorAll('.instance-button').forEach(btn => btn.classList.remove('active'));

    // Activate instance container
    const containerEl = document.getElementById(`instance-container-${instanceId}`);
    if (!containerEl) {
        console.error('[Navigation Tabs] Container not found for instance:', instanceId);
        return;
    }

    containerEl.classList.add('active');
    console.log('[Navigation Tabs] Container activated');

    // Activate sidebar button
    const button = document.querySelector(`[data-instance-id="${instanceId}"]`);
    if (button) {
        button.classList.add('active');
        button.classList.remove('unread');
        const dot = button.querySelector('.notification-dot');
        if (dot) dot.style.display = 'none';

        // Update welcome button text
        const welcomeBtn = document.getElementById('welcome-btn');
        if (welcomeBtn) {
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

    // Update active instance
    activeInstanceId = instanceId;

    // Initialize tabs for this instance if not exists
    if (!instanceTabsData[instanceId]) {
        console.log('[Navigation Tabs] Initializing tabs for instance:', instanceId);
        instanceTabsData[instanceId] = [];

        // Get the pre-created WhatsApp tab from the container
        const whatsappTabEl = containerEl._whatsappTabElement;
        const whatsappWebview = containerEl._whatsappWebview; // Using stored reference

        // Fallback: try to find elements if reference missing
        const foundTab = whatsappTabEl || document.querySelector(`[data-tab-id="whatsapp-${instanceId}"]`);
        // If webview reference is missing, try to find it. But wait! The ID is 'instanceId'.
        const foundWebview = whatsappWebview || document.getElementById(instanceId);

        if (foundTab && foundWebview) {
            console.log('[Navigation Tabs] Found pre-created WhatsApp tab');
            // Mark as active (first tab)
            foundTab.classList.add('active');

            // Store in tabs data
            instanceTabsData[instanceId].push({
                tabId: `whatsapp-${instanceId}`,
                tabEl: foundTab,
                webview: foundWebview,
                isWhatsApp: true
            });
            attachWebviewListeners(foundWebview);
        } else {
            console.error('[Navigation Tabs] WhatsApp tab or webview not found!', { foundTab, foundWebview });
        }
    } else {
        console.log('[Navigation Tabs] Instance already has tabs:', instanceTabsData[instanceId].length);
    }

    // Update header tabs to show this instance's tabs
    updateHeaderTabs(instanceId);
    updateUrlBar();
}

function createNavigationTab(instanceId, title) {
    console.log('[Navigation Tabs] Creating new tab:', { instanceId, title });
    const tabId = `tab-${instanceId}-${Date.now()}`;

    // Create tab element
    const tabEl = document.createElement('div');
    tabEl.className = 'sub-tab';
    tabEl.setAttribute('data-tab-id', tabId);
    tabEl.setAttribute('data-instance-id', instanceId);

    const icon = `
        <svg class="tab-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    `;

    const closeBtn = `
        <button class="close-sub-tab-btn" onclick="event.stopPropagation(); closeNavigationTab('${instanceId}', '${tabId}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    tabEl.innerHTML = `${icon}<span>${title}</span>${closeBtn}`;
    tabEl.onclick = () => switchNavigationTab(instanceId, tabId);

    // Create webview
    const webview = document.createElement('webview');
    webview.id = `webview-${tabId}`;
    webview.className = 'sub-webview';
    webview.src = 'https://www.google.com';
    webview.setAttribute('allowpopups', 'true');
    webview.style.display = 'flex'; // Ensure initial visibility
    attachWebviewListeners(webview);

    webview.addEventListener('page-title-updated', (e) => {
        const titleSpan = tabEl.querySelector('span');
        if (titleSpan) titleSpan.textContent = e.title;
    });

    // Favicon update - usando dom-ready para garantir que a página carregou
    const updateFavicon = async () => {
        try {
            // Aguarda um pouco para garantir que o DOM está pronto
            await new Promise(resolve => setTimeout(resolve, 800));

            const faviconUrl = await webview.executeJavaScript(`
                (function() {
                    // Tenta múltiplas estratégias para encontrar o favicon
                    const selectors = [
                        'link[rel="icon"]',
                        'link[rel="shortcut icon"]',
                        'link[rel="apple-touch-icon"]',
                        'link[rel*="icon"]'
                    ];
                    
                    for (let selector of selectors) {
                        const links = document.querySelectorAll(selector);
                        for (let link of links) {
                            if (link.href && (link.href.startsWith('http') || link.href.startsWith('data:'))) {
                                console.log('Favicon encontrado via', selector, ':', link.href);
                                return link.href;
                            }
                        }
                    }
                    
                    // Fallback para favicon.ico
                    const fallbackUrl = window.location.origin + '/favicon.ico';
                    console.log('Usando fallback:', fallbackUrl);
                    return fallbackUrl;
                })();
            `);

            console.log('[Navigation Tabs] Favicon URL encontrada:', faviconUrl);

            if (faviconUrl) {
                const existingIcon = tabEl.querySelector('.tab-icon');

                console.log('[Navigation Tabs] existingIcon encontrado:', existingIcon, 'tagName:', existingIcon?.tagName);

                if (existingIcon) {
                    if (existingIcon.tagName === 'IMG') {
                        // Já é uma imagem, apenas atualiza a src
                        existingIcon.src = faviconUrl;
                        console.log('[Navigation Tabs] Favicon atualizado em IMG existente');
                    } else {
                        // É SVG, precisa substituir por IMG
                        console.log('[Navigation Tabs] Criando nova IMG para substituir SVG');
                        const img = document.createElement('img');
                        img.className = 'tab-icon favicon';
                        img.src = faviconUrl;
                        img.style.width = '14px';
                        img.style.height = '14px';
                        img.onerror = () => {
                            console.log('[Navigation Tabs] Erro ao carregar favicon:', faviconUrl);
                            // Tenta novamente com /favicon.ico se a URL original falhou
                            if (!faviconUrl.endsWith('/favicon.ico')) {
                                webview.executeJavaScript('window.location.origin + "/favicon.ico"')
                                    .then(fallbackUrl => {
                                        console.log('[Navigation Tabs] Tentando fallback:', fallbackUrl);
                                        img.src = fallbackUrl;
                                    });
                            }
                        };
                        img.onload = () => {
                            console.log('[Navigation Tabs] Favicon IMG carregado com sucesso!');
                        };

                        // Verifica se o elemento ainda está no DOM antes de substituir
                        if (existingIcon.parentNode === tabEl) {
                            console.log('[Navigation Tabs] Substituindo SVG por IMG');
                            tabEl.replaceChild(img, existingIcon);
                        } else {
                            console.log('[Navigation Tabs] Elemento já foi removido, ignorando substituição');
                        }
                    }
                } else {
                    console.log('[Navigation Tabs] AVISO: Nenhum .tab-icon encontrado no tabEl');
                }
            }
        } catch (err) {
            console.log('[Navigation Tabs] Erro ao buscar favicon:', err);
        }
    };

    webview.addEventListener('dom-ready', updateFavicon);
    webview.addEventListener('did-navigate', updateFavicon);

    const subWebviewsContainer = document.getElementById(`sub-webviews-${instanceId}`);
    if (subWebviewsContainer) {
        subWebviewsContainer.appendChild(webview);
        console.log('[Navigation Tabs] Added new webview to container');
    } else {
        console.error('[Navigation Tabs] sub-webviews container not found for instance:', instanceId);
    }

    // Store tab data
    if (!instanceTabsData[instanceId]) instanceTabsData[instanceId] = [];
    instanceTabsData[instanceId].push({ tabId, tabEl, webview, isWhatsApp: false });
    console.log('[Navigation Tabs] Tab created and stored. Total tabs:', instanceTabsData[instanceId].length);

    return tabId;
}

function updateHeaderTabs(instanceId) {
    console.log('[Navigation Tabs] Updating header tabs for instance:', instanceId);
    const tabsContainer = document.getElementById('tabs-container');
    if (!tabsContainer) {
        console.error('[Navigation Tabs] tabs-container not found in DOM!');
        return;
    }

    tabsContainer.innerHTML = ''; // Clear current tabs

    const tabs = instanceTabsData[instanceId] || [];
    console.log('[Navigation Tabs] Adding', tabs.length, 'tabs to header');
    tabs.forEach(({ tabEl }) => {
        tabsContainer.appendChild(tabEl);
    });

    // Add "+" button (only once at the end)
    const addBtn = document.createElement('button');
    addBtn.className = 'add-sub-tab-btn';
    addBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    `;
    addBtn.onclick = () => {
        const newTabId = createNavigationTab(instanceId, 'Nova guia');
        updateHeaderTabs(instanceId);
        switchNavigationTab(instanceId, newTabId);
    };
    tabsContainer.appendChild(addBtn);
    console.log('[Navigation Tabs] Header tabs updated successfully');
}

function switchNavigationTab(instanceId, tabId) {
    console.log('[Navigation Tabs] Switching to tab:', tabId);
    if (instanceId !== activeInstanceId) {
        console.warn('[Navigation Tabs] Mismatch instance ID. Ignoring switch.');
        // Still allow if forced, but usually we only switch tabs for active instance
        // return; 
    }

    const tabs = instanceTabsData[instanceId];
    if (!tabs) {
        console.error('[Navigation Tabs] No tabs found for instance:', instanceId);
        return;
    }

    // Deactivate all tabs and hide webviews
    tabs.forEach(({ tabEl, webview }) => {
        tabEl.classList.remove('active');
        if (webview) {
            webview.classList.remove('active');
            webview.style.display = 'none';
        }
    });

    // Activate selected tab
    const activeTab = tabs.find(t => t.tabId === tabId);
    if (activeTab) {
        activeTab.tabEl.classList.add('active');
        if (activeTab.webview) {
            activeTab.webview.classList.add('active');
            activeTab.webview.style.display = 'flex';
        }
        console.log('[Navigation Tabs] Tab switched successfully');
        updateUrlBar();
    } else {
        console.error('[Navigation Tabs] Tab not found:', tabId);
    }
}

function closeNavigationTab(instanceId, tabId) {
    console.log('[Navigation Tabs] Closing tab:', tabId);
    const tabs = instanceTabsData[instanceId];
    if (!tabs) return;

    const tabIndex = tabs.findIndex(t => t.tabId === tabId);
    if (tabIndex === -1) return;

    const { tabEl, webview, isWhatsApp } = tabs[tabIndex];

    // Don't allow closing WhatsApp tab
    if (isWhatsApp) {
        console.warn('[Navigation Tabs] Cannot close WhatsApp tab');
        return;
    }

    const wasActive = tabEl.classList.contains('active');

    // Remove from DOM
    if (tabEl) tabEl.remove();
    if (webview) webview.remove();

    // Remove from data
    tabs.splice(tabIndex, 1);

    // If was active, switch to WhatsApp tab
    if (wasActive && tabs.length > 0) {
        const whatsappTab = tabs.find(t => t.isWhatsApp);
        if (whatsappTab) {
            switchNavigationTab(instanceId, whatsappTab.tabId);
        }
    }

    updateHeaderTabs(instanceId);
}

// Export functions to window
window.activateInstance = activateInstanceWithTabs;
window.closeNavigationTab = closeNavigationTab;
window.createNavigationTab = createNavigationTab;
window.switchNavigationTab = switchNavigationTab;
console.log('[Navigation Tabs] Functions exported');

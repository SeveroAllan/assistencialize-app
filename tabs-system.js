// Tabs System: Each instance has its own tab with sub-tabs
// This file manages the header tabs and sub-tabs for each WhatsApp instance

const TabsSystem = {
    tabsContainer: null,
    profilesWebviewContainer: null,
    activeInstanceId: null,
    instanceTabs: {}, // { instanceId: { tabEl, containerEl, subTabs: [], activeSubTabId } }

    init() {
        this.tabsContainer = document.getElementById('tabs-container');
        this.profilesWebviewContainer = document.getElementById('profiles-webview-container');
    },

    createInstanceTab(instance) {
        const { id, name } = instance;

        // Create tab element in header
        const tabEl = document.createElement('div');
        tabEl.className = 'tab';
        tabEl.setAttribute('data-tab-id', id);
        tabEl.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>${name}</span>
        `;

        tabEl.onclick = () => this.switchToInstance(id);
        this.tabsContainer.appendChild(tabEl);

        // Create instance container with sub-tabs bar
        const containerEl = document.createElement('div');
        containerEl.className = 'instance-container';
        containerEl.id = `instance-container-${id}`;
        containerEl.innerHTML = `
            <div class="sub-tabs-bar" id="sub-tabs-bar-${id}">
                <div class="sub-tab active" data-sub-tab-id="whatsapp-${id}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>WhatsApp</span>
                </div>
                <button class="add-sub-tab-btn" data-instance-id="${id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>
            <div class="sub-webviews-container" id="sub-webviews-${id}">
                <!-- Sub-webviews will be added here -->
            </div>
        `;

        this.profilesWebviewContainer.appendChild(containerEl);

        // Store instance tab data
        this.instanceTabs[id] = {
            tabEl,
            containerEl,
            subTabs: [],
            activeSubTabId: `whatsapp-${id}`
        };

        // Add click handler for add sub-tab button
        const addSubTabBtn = containerEl.querySelector('.add-sub-tab-btn');
        addSubTabBtn.onclick = () => this.createSubTab(id);

        // Add click handler for WhatsApp sub-tab
        const whatsappSubTab = containerEl.querySelector(`[data-sub-tab-id="whatsapp-${id}"]`);
        whatsappSubTab.onclick = () => this.switchSubTab(id, `whatsapp-${id}`);
    },

    createSubTab(instanceId, url = 'https://www.google.com') {
        const subTabId = `sub-${instanceId}-${Date.now()}`;
        const instanceData = this.instanceTabs[instanceId];

        if (!instanceData) return;

        const subTabsBar = document.getElementById(`sub-tabs-bar-${instanceId}`);
        const addBtn = subTabsBar.querySelector('.add-sub-tab-btn');

        // Create sub-tab element
        const subTabEl = document.createElement('div');
        subTabEl.className = 'sub-tab';
        subTabEl.setAttribute('data-sub-tab-id', subTabId);
        subTabEl.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>Nova guia</span>
            <button class="close-sub-tab-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        subTabEl.onclick = (e) => {
            if (!e.target.closest('.close-sub-tab-btn')) {
                this.switchSubTab(instanceId, subTabId);
            }
        };

        const closeBtn = subTabEl.querySelector('.close-sub-tab-btn');
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.closeSubTab(instanceId, subTabId);
        };

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

        const subWebviewsContainer = document.getElementById(`sub-webviews-${instanceId}`);
        subWebviewsContainer.appendChild(webview);

        instanceData.subTabs.push({ subTabId, subTabEl, webview });

        // Switch to new sub-tab
        this.switchSubTab(instanceId, subTabId);
    },

    switchSubTab(instanceId, subTabId) {
        const instanceData = this.instanceTabs[instanceId];
        if (!instanceData) return;

        // Deactivate current sub-tab
        const subTabsBar = document.getElementById(`sub-tabs-bar-${instanceId}`);
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
            // Show WhatsApp webview (old system)
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

        instanceData.activeSubTabId = subTabId;
    },

    closeSubTab(instanceId, subTabId) {
        const instanceData = this.instanceTabs[instanceId];
        if (!instanceData) return;

        // Remove sub-tab element
        const subTabsBar = document.getElementById(`sub-tabs-bar-${instanceId}`);
        const subTabEl = subTabsBar.querySelector(`[data-sub-tab-id="${subTabId}"]`);
        if (subTabEl) subTabEl.remove();

        // Remove webview
        const webview = document.getElementById(`webview-${subTabId}`);
        if (webview) webview.remove();

        // Remove from array
        instanceData.subTabs = instanceData.subTabs.filter(st => st.subTabId !== subTabId);

        // If closed tab was active, switch to WhatsApp
        if (instanceData.activeSubTabId === subTabId) {
            this.switchSubTab(instanceId, `whatsapp-${instanceId}`);
        }
    },

    switchToInstance(instanceId) {
        // Deactivate all instance tabs
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

        // Hide all instance containers
        document.querySelectorAll('.instance-container').forEach(container => {
            container.classList.remove('active');
        });

        // Activate selected instance tab
        const instanceData = this.instanceTabs[instanceId];
        if (instanceData) {
            instanceData.tabEl.classList.add('active');
            instanceData.containerEl.classList.add('active');
            this.activeInstanceId = instanceId;

            // Also update sidebar button state
            document.querySelectorAll('.instance-button').forEach(btn => btn.classList.remove('active'));
            const button = document.querySelector(`[data-instance-id="${instanceId}"]`);
            if (button) button.classList.add('active');
        }
    },

    removeInstanceTab(instanceId) {
        const instanceData = this.instanceTabs[instanceId];
        if (!instanceData) return;

        // Remove tab element
        if (instanceData.tabEl) instanceData.tabEl.remove();

        // Remove container
        if (instanceData.containerEl) instanceData.containerEl.remove();

        // Clean up
        delete this.instanceTabs[instanceId];

        // If this was active, switch to first available instance
        if (this.activeInstanceId === instanceId) {
            const remainingIds = Object.keys(this.instanceTabs);
            if (remainingIds.length > 0) {
                this.switchToInstance(remainingIds[0]);
            } else {
                this.activeInstanceId = null;
            }
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TabsSystem.init());
} else {
    TabsSystem.init();
}

// Export for use in renderer.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabsSystem;
}

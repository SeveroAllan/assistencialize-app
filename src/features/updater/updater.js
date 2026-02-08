// Auto-update notification handler
(function () {
    try {
        const { ipcRenderer } = require('electron');

        // Listen for update events
        ipcRenderer.on('update-available', (event, info) => {
            showUpdateNotification('Nova atualização disponível!', `Versão ${info.version} está sendo baixada...`, 'info');
        });

        ipcRenderer.on('download-progress', (event, progressObj) => {
            const percent = Math.round(progressObj.percent);
            updateProgressNotification(`Baixando atualização: ${percent}%`);
        });

        ipcRenderer.on('update-downloaded', (event, info) => {
            showUpdateNotification(
                'Atualização pronta!',
                `Versão ${info.version} foi baixada. Clique para reiniciar e instalar.`,
                'success',
                () => {
                    ipcRenderer.send('install-update');
                }
            );
        });

        function showUpdateNotification(title, message, type = 'info', onClick = null) {
            // Remove existing notification
            const existing = document.getElementById('update-notification');
            if (existing) existing.remove();

            const notification = document.createElement('div');
            notification.id = 'update-notification';
            notification.className = `update-notification ${type}`;
            notification.innerHTML = `
                <div class="update-content">
                    <div class="update-icon">
                        ${type === 'success' ? '✓' : 'ℹ'}
                    </div>
                    <div class="update-text">
                        <strong>${title}</strong>
                        <p>${message}</p>
                    </div>
                    ${onClick ? '<button class="update-install-btn">Instalar Agora</button>' : ''}
                    <button class="update-close-btn">×</button>
                </div>
                <div class="update-progress" id="update-progress"></div>
            `;

            document.body.appendChild(notification);

            // Add event listeners
            const closeBtn = notification.querySelector('.update-close-btn');
            closeBtn.addEventListener('click', () => notification.remove());

            if (onClick) {
                const installBtn = notification.querySelector('.update-install-btn');
                installBtn.addEventListener('click', onClick);
            }

            // Auto-hide info notifications after 5 seconds
            if (type === 'info' && !onClick) {
                setTimeout(() => {
                    if (notification.parentNode) notification.remove();
                }, 5000);
            }
        }

        function updateProgressNotification(message) {
            const notification = document.getElementById('update-notification');
            if (notification) {
                const textElement = notification.querySelector('.update-text p');
                if (textElement) {
                    textElement.textContent = message;
                }
            }
        }
    } catch (error) {
        console.error('Error initializing updater:', error);
    }
})();


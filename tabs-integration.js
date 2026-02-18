// Integration file to connect tabs-system.js with renderer.js
// Add this script AFTER renderer.js in index.html

const TabsSystem = require('./tabs-system.js');

// Override the createInstanceUI function to use TabsSystem
const originalCreateInstanceUI = window.createInstanceUI;

// Intercept instance creation to also create tabs
document.addEventListener('DOMContentLoaded', () => {
    // Hook into the loadInstances completion
    const originalLoadInstances = window.loadInstances;

    // We need to modify the renderer.js directly, but for now let's patch it
    // by listening to instance creation events

    console.log('Tabs system integration loaded');
});

// Export helper to be called from renderer.js
window.createInstanceTabForInstance = function (instance) {
    TabsSystem.createInstanceTab(instance);
};

window.activateInstanceTab = function (instanceId) {
    TabsSystem.switchToInstance(instanceId);
};

window.removeInstanceTabForInstance = function (instanceId) {
    TabsSystem.removeInstanceTab(instanceId);
};

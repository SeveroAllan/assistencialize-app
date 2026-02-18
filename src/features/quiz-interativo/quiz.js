document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.option-card');
    const continueBtn = document.getElementById('continue-btn');
    const backBtn = document.getElementById('back-btn');
    let selectedValue = null;

    // Handle Card Selection
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent if clicking action buttons (edit/delete)
            if (e.target.closest('.icon-btn')) return;

            // Deselect all others
            cards.forEach(c => c.classList.remove('selected'));

            // Select clicked
            card.classList.add('selected');
            selectedValue = card.getAttribute('data-value');

            // Enable Continue Button
            continueBtn.removeAttribute('disabled');
        });
    });

    // Handle Continue
    continueBtn.addEventListener('click', () => {
        if (!selectedValue) return;

        console.log('Selected option:', selectedValue);
        // Here you would navigate to next step or save preference

        // For visual feedback
        continueBtn.innerHTML = 'Carregando...';
        continueBtn.style.opacity = '0.8';

        setTimeout(() => {
            alert(`Você escolheu: ${selectedValue === 'assistente' ? 'Assistente Remota' : 'Secretária Executiva'}`);
            continueBtn.innerHTML = 'Continuar';
            continueBtn.style.opacity = '1';
        }, 500);
    });

    // Handle Back
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Try go back in browser history or close window if electron
            if (window.history.length > 1) {
                window.history.back();
            } else {
                console.log('No history to go back to.');
                // If integrated in Electron, maybe close window?
                // window.close() or ipcRenderer.send('close-quiz')
            }
        });
    }
});

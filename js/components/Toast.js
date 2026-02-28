// Toast.js

const Toast = {
    container: document.getElementById('toastContainer'),

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'alert-circle' : 'info';
        
        toast.innerHTML = `
            <i data-lucide="${icon}" class="icon"></i>
            <span>${message}</span>
        `;
        
        this.container.appendChild(toast);
        
        if (window.lucide) lucide.createIcons();
        
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    this.container.removeChild(toast);
                }
            }, 300);
        }, duration);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    info(message) {
        this.show(message, 'info');
    }
};

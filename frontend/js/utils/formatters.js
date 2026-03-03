// frontend/js/utils/formatters.js
const Formatters = {
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatTimeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'hace unos segundos';
        if (diffMins < 60) return `hace ${diffMins} minutos`;
        if (diffHours < 24) return `hace ${diffHours} horas`;
        if (diffDays < 7) return `hace ${diffDays} días`;
        return this.formatDate(date);
    },

    formatDistance(km) {
        if (km < 1) {
            return `${Math.round(km * 1000)} m`;
        }
        return `${km.toFixed(2)} km`;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount);
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
};

window.Formatters = Formatters;
// frontend/js/api/dashboard.js
const DashboardAPI = {
    async getOperationalData() {
        return apiClient.get('/dashboard');
    }
};

window.DashboardAPI = DashboardAPI;
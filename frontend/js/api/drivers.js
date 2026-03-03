// frontend/js/api/drivers.js
const DriversAPI = {
    async getAll() {
        return apiClient.get('/drivers');
    },

    async getById(driverId) {
        return apiClient.get(`/drivers/${driverId}`);
    },

    async create(driverData) {
        return apiClient.post('/drivers', driverData);
    },

    async updateLocation(driverId, latitude, longitude) {
        return apiClient.post(`/drivers/${driverId}/location`, {
            latitude,
            longitude
        });
    },

    async completeDelivery(driverId, orderId) {
        return apiClient.post(`/drivers/${driverId}/deliver`, { orderId });
    },

    async getRoute(driverId) {
        return apiClient.get(`/drivers/${driverId}`);
    }
};

window.DriversAPI = DriversAPI;
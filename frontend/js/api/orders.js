// frontend/js/api/orders.js
const OrdersAPI = {
    async getAll() {
        return apiClient.get('/orders');
    },

    async create(orderData) {
        return apiClient.post('/orders', orderData);
    },

    async assign(orderId) {
        return apiClient.post('/orders/assign', { orderId });
    }
};

window.OrdersAPI = OrdersAPI;
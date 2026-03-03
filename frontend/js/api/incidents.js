// frontend/js/api/incidents.js
const IncidentsAPI = {
    async create(incidentData) {
        return apiClient.post('/incidents', incidentData);
    },

    async resolve(incidentId) {
        return apiClient.patch(`/incidents/${incidentId}/resolve`, {});
    }
};

window.IncidentsAPI = IncidentsAPI;
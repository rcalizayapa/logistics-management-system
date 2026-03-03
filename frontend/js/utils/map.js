// frontend/js/utils/map.js
class LogisticsMap {
    constructor(elementId, options = {}) {
        this.map = L.map(elementId, {
            center: options.center || [-12.0464, -77.0428], // Lima por defecto
            zoom: options.zoom || 12,
            ...options
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.markers = new Map();
        this.routes = new Map();
    }

    addDriverMarker(driverId, latitude, longitude, name) {
        const marker = L.marker([latitude, longitude])
            .bindPopup(`<b>Conductor:</b> ${name}`)
            .addTo(this.map);
        
        this.markers.set(driverId, marker);
        return marker;
    }

    updateDriverLocation(driverId, latitude, longitude) {
        const marker = this.markers.get(driverId);
        if (marker) {
            marker.setLatLng([latitude, longitude]);
        }
    }

    addOrderMarker(orderId, latitude, longitude, address, status) {
        const color = this.getStatusColor(status);
        const marker = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        })
        .bindPopup(`<b>Pedido:</b> ${orderId}<br><b>Dirección:</b> ${address}<br><b>Estado:</b> ${status}`)
        .addTo(this.map);
        
        this.markers.set(`order_${orderId}`, marker);
        return marker;
    }

    drawRoute(routeId, points, color = '#2563eb') {
        const latLngs = points.map(p => [p.lat, p.lng]);
        const route = L.polyline(latLngs, { color, weight: 4, opacity: 0.7 }).addTo(this.map);
        this.routes.set(routeId, route);
        return route;
    }

    getStatusColor(status) {
        const colors = {
            'PENDING': '#f59e0b',
            'IN_TRANSIT': '#3b82f6',
            'DELIVERED': '#10b981',
            'INCIDENT': '#ef4444'
        };
        return colors[status] || '#6b7280';
    }

    fitBounds() {
        const group = L.featureGroup(Array.from(this.markers.values()));
        this.map.fitBounds(group.getBounds().pad(0.1));
    }

    clearAll() {
        this.markers.forEach(marker => marker.remove());
        this.markers.clear();
        this.routes.forEach(route => route.remove());
        this.routes.clear();
    }
}

window.LogisticsMap = LogisticsMap;
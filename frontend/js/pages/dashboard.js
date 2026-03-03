// frontend/js/pages/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar mapa
    const logisticsMap = new LogisticsMap('liveMap');
    window.logisticsMap = logisticsMap;

    // Inicializar conexión SSE para eventos en tiempo real
    const sse = new SSEConnection(
        'http://localhost:3000/monitor',
        handleRealtimeEvent,
        (error) => console.error('SSE Error:', error)
    );
    sse.connect();

    // Cargar datos iniciales
    await loadDashboardData();
    await loadActiveOrders();
    await loadDriversLocation();

    // Actualizar fecha y hora
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Event listeners
    document.getElementById('refreshDashboard').addEventListener('click', refreshDashboard);
});

async function loadDashboardData() {
    try {
        const data = await DashboardAPI.getOperationalData();
        updateKPIs(data);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error al cargar datos del dashboard', 'error');
    }
}

async function loadActiveOrders() {
    try {
        const orders = await OrdersAPI.getAll();
        const activeOrders = orders.filter(o => 
            o.status !== 'DELIVERED' && o.assignedDriver
        );
        renderActiveOrders(activeOrders);
        
        // Agregar marcadores de pedidos al mapa
        activeOrders.forEach(order => {
            const location = order.location;
            logisticsMap.addOrderMarker(
                order.id,
                location.latitude,
                location.longitude,
                location.address,
                order.status
            );
        });
    } catch (error) {
        console.error('Error loading active orders:', error);
    }
}

async function loadDriversLocation() {
    try {
        const drivers = await DriversAPI.getAll();
        drivers.forEach(driver => {
            if (driver.currentLocation) {
                logisticsMap.addDriverMarker(
                    driver.id,
                    driver.currentLocation.latitude,
                    driver.currentLocation.longitude,
                    driver.name
                );
            }
        });
        logisticsMap.fitBounds();
    } catch (error) {
        console.error('Error loading drivers location:', error);
    }
}

function updateKPIs(data) {
    document.getElementById('totalDrivers').textContent = data.drivers.total;
    document.getElementById('availableDrivers').textContent = data.drivers.available;
    document.getElementById('totalOrders').textContent = data.orders.total;
    document.getElementById('deliveredOrders').textContent = data.orders.delivered;
    
    const totalIncidents = data.incidents.open + data.incidents.inProgress + data.incidents.resolved;
    document.getElementById('totalIncidents').textContent = totalIncidents;
    document.getElementById('openIncidents').textContent = data.incidents.open;
    
    const performance = data.orders.total > 0 
        ? Math.round((data.orders.delivered / data.orders.total) * 100)
        : 0;
    document.getElementById('performanceRate').textContent = `${performance}%`;
}

function renderActiveOrders(orders) {
    const tbody = document.getElementById('activeOrdersBody');
    tbody.innerHTML = '';

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.assignedDriver || 'Sin asignar'}</td>
            <td>${order.location.address}</td>
            <td>${order.deliveryType}</td>
            <td><span class="status-badge ${order.status.toLowerCase().replace('_', '-')}">${order.status}</span></td>
            <td>
                <button class="action-btn" onclick="trackOrder('${order.id}')">Seguir</button>
                ${order.status === 'IN_TRANSIT' ? 
                    `<button class="action-btn" onclick="reportIncident('${order.id}')">Reportar</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function handleRealtimeEvent(event) {
    console.log('Evento en tiempo real:', event);
    
    // Añadir al feed de actividades
    addToActivityFeed(event);
    
    // Actualizar según tipo de evento
    switch (event.type) {
        case 'LOCATION':
            logisticsMap.updateDriverLocation(event.driverId, event.latitude, event.longitude);
            break;
        case 'ASSIGNMENT':
            loadActiveOrders(); // Recargar pedidos activos
            break;
        case 'DELIVERY':
            loadDashboardData(); // Actualizar KPIs
            loadActiveOrders(); // Recargar pedidos activos
            break;
        case 'INCIDENT_CREATED':
        case 'INCIDENT_UPDATED':
        case 'INCIDENT_RESOLVED':
            loadDashboardData(); // Actualizar KPIs
            break;
    }
}

function addToActivityFeed(event) {
    const feed = document.getElementById('activityFeed');
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    let icon = '';
    let text = '';
    
    switch (event.type) {
        case 'ASSIGNMENT':
            icon = '📋';
            text = `Pedido ${event.orderId} asignado a conductor ${event.driverId}`;
            break;
        case 'DELIVERY':
            icon = '✅';
            text = `Pedido ${event.orderId} entregado por conductor ${event.driverId}`;
            break;
        case 'INCIDENT_CREATED':
            icon = '⚠️';
            text = `Incidencia reportada: ${event.description}`;
            break;
        default:
            icon = '🔄';
            text = JSON.stringify(event);
    }
    
    activityItem.innerHTML = `
        <div class="activity-icon">${icon}</div>
        <div class="activity-content">
            <div class="activity-text">${text}</div>
            <div class="activity-time">${Formatters.formatTimeAgo(new Date())}</div>
        </div>
    `;
    
    feed.insertBefore(activityItem, feed.firstChild);
    
    // Mantener solo los últimos 50 items
    while (feed.children.length > 50) {
        feed.removeChild(feed.lastChild);
    }
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDateTime').textContent = 
        now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
}

async function refreshDashboard() {
    await loadDashboardData();
    await loadActiveOrders();
    showNotification('Dashboard actualizado', 'success');
}

function showNotification(message, type = 'info') {
    // Implementar notificaciones (puedes usar una librería o crear un componente simple)
    console.log(`[${type}] ${message}`);
    alert(message); // Simple por ahora, mejorar después
}

// Funciones globales para botones
window.trackOrder = (orderId) => {
    console.log('Tracking order:', orderId);
    // Implementar seguimiento
};

window.reportIncident = (orderId) => {
    console.log('Report incident for order:', orderId);
    // Implementar reporte de incidencia
};
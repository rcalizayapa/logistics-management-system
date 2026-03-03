// frontend/js/pages/orders.js

let allOrders = [];
let allDrivers = [];

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    loadDrivers();
    setupEventListeners();
    updateOrderStats();
});

function setupEventListeners() {
    // Modal de creación
    document.getElementById('openCreateOrderModal').addEventListener('click', () => {
        openModal('createOrderModal');
    });

    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
        });
    });

    // Formularios
    document.getElementById('createOrderForm').addEventListener('submit', handleCreateOrder);
    document.getElementById('confirmAssign').addEventListener('click', handleAssignOrder);

    // Filtros
    document.getElementById('searchOrder').addEventListener('input', filterOrders);
    document.getElementById('filterStatus').addEventListener('change', filterOrders);
    document.getElementById('filterType').addEventListener('change', filterOrders);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

async function loadOrders() {
    try {
        allOrders = await OrdersAPI.getAll();
        renderOrdersTable(allOrders);
        updateOrderStats();
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Error al cargar pedidos', 'error');
    }
}

async function loadDrivers() {
    try {
        allDrivers = await DriversAPI.getAll();
        populateDriverSelect();
    } catch (error) {
        console.error('Error loading drivers:', error);
    }
}

function populateDriverSelect() {
    const select = document.getElementById('driverSelect');
    const availableDrivers = allDrivers.filter(d => d.available !== false);
    
    if (availableDrivers.length === 0) {
        select.innerHTML = '<option value="">No hay conductores disponibles</option>';
        return;
    }

    select.innerHTML = '<option value="">Seleccionar conductor...</option>' +
        availableDrivers.map(d => 
            `<option value="${d.id}">${d.name} (${d.id})</option>`
        ).join('');
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No hay pedidos registrados</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const driver = allDrivers.find(d => d.id === order.assignedDriver);
        const driverName = driver ? driver.name : 'Sin asignar';
        const timeWindow = order.timeWindowStart && order.timeWindowEnd 
            ? `${new Date(order.timeWindowStart).toLocaleTimeString()} - ${new Date(order.timeWindowEnd).toLocaleTimeString()}`
            : 'No definida';

        return `
            <tr>
                <td>${order.id}</td>
                <td>${order.location?.address || 'Sin dirección'}</td>
                <td><span class="status-badge ${order.deliveryType?.toLowerCase()}">${order.deliveryType || 'STANDARD'}</span></td>
                <td><span class="status-badge ${order.status?.toLowerCase().replace('_', '-')}">${order.status || 'PENDING'}</span></td>
                <td>${driverName}</td>
                <td>${timeWindow}</td>
                <td>
                    ${!order.assignedDriver && order.status === 'PENDING' 
                        ? `<button class="action-btn" onclick="showAssignModal('${order.id}')">Asignar</button>` 
                        : ''}
                    ${order.status === 'IN_TRANSIT' 
                        ? `<button class="action-btn" onclick="trackOrder('${order.id}')">Seguir</button>` 
                        : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function updateOrderStats() {
    const pending = allOrders.filter(o => o.status === 'PENDING').length;
    const inTransit = allOrders.filter(o => o.status === 'IN_TRANSIT').length;
    const delivered = allOrders.filter(o => o.status === 'DELIVERED').length;
    const express = allOrders.filter(o => o.deliveryType === 'EXPRESS').length;

    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('transitCount').textContent = inTransit;
    document.getElementById('deliveredToday').textContent = delivered;
    document.getElementById('expressCount').textContent = express;
}

async function handleCreateOrder(e) {
    e.preventDefault();
    
    const start = new Date(document.getElementById('timeWindowStart').value);
    const end = new Date(document.getElementById('timeWindowEnd').value);

    const orderData = {
        id: document.getElementById('orderId').value,
        latitude: parseFloat(document.getElementById('orderLatitude').value),
        longitude: parseFloat(document.getElementById('orderLongitude').value),
        address: document.getElementById('orderAddress').value,
        deliveryType: document.getElementById('deliveryType').value,
        start: start.toISOString(),
        end: end.toISOString()
    };

    try {
        await OrdersAPI.create(orderData);
        showNotification('Pedido creado exitosamente', 'success');
        closeModal('createOrderModal');
        document.getElementById('createOrderForm').reset();
        await loadOrders(); // Recargar lista
    } catch (error) {
        console.error('Error creating order:', error);
        showNotification('Error al crear pedido: ' + error.message, 'error');
    }
}

function filterOrders() {
    const searchTerm = document.getElementById('searchOrder').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const typeFilter = document.getElementById('filterType').value;

    let filtered = allOrders;

    if (searchTerm) {
        filtered = filtered.filter(o => 
            o.id.toLowerCase().includes(searchTerm) ||
            (o.location?.address && o.location.address.toLowerCase().includes(searchTerm))
        );
    }

    if (statusFilter !== 'all') {
        filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (typeFilter !== 'all') {
        filtered = filtered.filter(o => o.deliveryType === typeFilter);
    }

    renderOrdersTable(filtered);
}

function showAssignModal(orderId) {
    document.getElementById('assignOrderId').textContent = orderId;
    openModal('assignDriverModal');
    
    // Guardar orderId para usarlo en la asignación
    document.getElementById('confirmAssign').dataset.orderId = orderId;
}

async function handleAssignOrder() {
    const orderId = document.getElementById('confirmAssign').dataset.orderId;
    const driverId = document.getElementById('driverSelect').value;

    if (!driverId) {
        showNotification('Debe seleccionar un conductor', 'error');
        return;
    }

    try {
        // Primero asignar el pedido
        await OrdersAPI.assign(orderId);
        
        showNotification('Pedido asignado exitosamente', 'success');
        closeModal('assignDriverModal');
        await loadOrders(); // Recargar lista
        await loadDrivers(); // Recargar conductores (disponibilidad cambió)
    } catch (error) {
        console.error('Error assigning order:', error);
        showNotification('Error al asignar pedido: ' + error.message, 'error');
    }
}

function trackOrder(orderId) {
    window.location.href = `dashboard.html?trackOrder=${orderId}`;
}

// Reutilizar funciones de utilidades de drivers.js
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 0.375rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Hacer funciones globales
window.showAssignModal = showAssignModal;
window.trackOrder = trackOrder;
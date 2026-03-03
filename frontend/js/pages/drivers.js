// frontend/js/pages/drivers.js

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar mapa de conductores
    const driversMap = new LogisticsMap('driversMap', {
        center: [-12.0464, -77.0428],
        zoom: 12
    });
    window.driversMap = driversMap;

    // Cargar datos iniciales
    loadDrivers();
    setupEventListeners();
});

function setupEventListeners() {
    // Modal de creación
    document.getElementById('openCreateDriverModal').addEventListener('click', () => {
        openModal('createDriverModal');
    });

    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
        });
    });

    // Formulario de creación
    document.getElementById('createDriverForm').addEventListener('submit', handleCreateDriver);

    // Búsqueda y filtros
    document.getElementById('searchDriver').addEventListener('input', filterDrivers);
    document.getElementById('filterAvailability').addEventListener('change', filterDrivers);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

async function loadDrivers() {
    try {
        const drivers = await DriversAPI.getAll();
        renderDriversTable(drivers);
        updateDriversMap(drivers);
    } catch (error) {
        console.error('Error loading drivers:', error);
        showNotification('Error al cargar conductores', 'error');
    }
}

function renderDriversTable(drivers) {
    const tbody = document.getElementById('driversTableBody');
    
    if (!drivers || drivers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No hay conductores registrados</td></tr>`;
        return;
    }

    tbody.innerHTML = drivers.map(driver => {
        const location = driver.currentLocation || { latitude: '-', longitude: '-', address: 'Sin ubicación' };
        const status = driver.available !== false ? 'available' : 'busy';
        const statusText = driver.available !== false ? 'Disponible' : 'Ocupado';
        
        return `
            <tr>
                <td>${driver.id}</td>
                <td>${driver.name || 'Sin nombre'}</td>
                <td>${location.address}<br>
                    <small>${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}</small>
                </td>
                <td><span class="status-badge ${status}">${statusText}</span></td>
                <td>${driver.assignedOrders?.length || 0}</td>
                <td>${driver.deliveredOrders?.length || 0}</td>
                <td>
                    <button class="action-btn" onclick="viewDriverDetails('${driver.id}')">Ver</button>
                    <button class="action-btn" onclick="trackDriver('${driver.id}')">Seguir</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateDriversMap(drivers) {
    // Limpiar marcadores existentes
    if (window.driversMap) {
        // No hay método clear, así que creamos nuevo mapa
        window.driversMap = new LogisticsMap('driversMap', {
            center: [-12.0464, -77.0428],
            zoom: 12
        });
    }

    drivers.forEach(driver => {
        if (driver.currentLocation) {
            window.driversMap.addDriverMarker(
                driver.id,
                driver.currentLocation.latitude,
                driver.currentLocation.longitude,
                driver.name || 'Conductor'
            );
        }
    });

    if (drivers.length > 0) {
        window.driversMap.fitBounds();
    }
}

async function handleCreateDriver(e) {
    e.preventDefault();
    
    const driverData = {
        id: document.getElementById('driverId').value,
        name: document.getElementById('driverName').value,
        latitude: parseFloat(document.getElementById('driverLatitude').value),
        longitude: parseFloat(document.getElementById('driverLongitude').value),
        address: document.getElementById('driverAddress').value
    };

    try {
        await DriversAPI.create(driverData);
        showNotification('Conductor creado exitosamente', 'success');
        closeModal('createDriverModal');
        document.getElementById('createDriverForm').reset();
        await loadDrivers(); // Recargar lista
    } catch (error) {
        console.error('Error creating driver:', error);
        showNotification('Error al crear conductor: ' + error.message, 'error');
    }
}

function filterDrivers() {
    const searchTerm = document.getElementById('searchDriver').value.toLowerCase();
    const filterStatus = document.getElementById('filterAvailability').value;

    // Como no tenemos todos los drivers en memoria, recargamos y filtramos
    DriversAPI.getAll().then(drivers => {
        let filtered = drivers;

        if (searchTerm) {
            filtered = filtered.filter(d => 
                d.id.toLowerCase().includes(searchTerm) ||
                (d.name && d.name.toLowerCase().includes(searchTerm))
            );
        }

        if (filterStatus !== 'all') {
            const isAvailable = filterStatus === 'available';
            filtered = filtered.filter(d => d.available === isAvailable);
        }

        renderDriversTable(filtered);
        updateDriversMap(filtered);
    });
}

async function viewDriverDetails(driverId) {
    try {
        const driver = await DriversAPI.getById(driverId);
        const modal = document.getElementById('driverDetailsModal');
        const content = document.getElementById('driverDetailsContent');
        
        // Crear mapa de ruta
        setTimeout(() => {
            const routeMap = new LogisticsMap('driverRouteMap', {
                center: [driver.currentLocation?.latitude || -12.0464, 
                        driver.currentLocation?.longitude || -77.0428],
                zoom: 13
            });
            
            if (driver.currentLocation) {
                routeMap.addDriverMarker(
                    driver.id,
                    driver.currentLocation.latitude,
                    driver.currentLocation.longitude,
                    driver.name
                );
            }
        }, 100);

        // Mostrar pedidos asignados
        const ordersHtml = driver.assignedOrders?.length > 0 
            ? driver.assignedOrders.map(orderId => `<li>${orderId}</li>`).join('')
            : '<p>No hay pedidos asignados</p>';

        content.innerHTML = `
            <h3>${driver.name}</h3>
            <p><strong>ID:</strong> ${driver.id}</p>
            <p><strong>Estado:</strong> ${driver.available ? 'Disponible' : 'Ocupado'}</p>
            <p><strong>Ubicación:</strong> ${driver.currentLocation?.address || 'N/A'}</p>
            <p><strong>Coordenadas:</strong> ${driver.currentLocation?.latitude?.toFixed(4)}, ${driver.currentLocation?.longitude?.toFixed(4)}</p>
            <p><strong>Entregas completadas:</strong> ${driver.deliveredOrders?.length || 0}</p>
            <h4>Pedidos Asignados</h4>
            <ul>${ordersHtml}</ul>
        `;

        openModal('driverDetailsModal');
    } catch (error) {
        console.error('Error loading driver details:', error);
        showNotification('Error al cargar detalles del conductor', 'error');
    }
}

function trackDriver(driverId) {
    window.location.href = `dashboard.html?trackDriver=${driverId}`;
}

// Utilidades de modales
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showNotification(message, type = 'info') {
    // Crear elemento de notificación
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

// Hacer funciones globales para los botones
window.viewDriverDetails = viewDriverDetails;
window.trackDriver = trackDriver;
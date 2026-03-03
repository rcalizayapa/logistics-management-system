// frontend/js/pages/incidents.js

let allIncidents = [];

document.addEventListener('DOMContentLoaded', () => {
    loadIncidents();
    setupEventListeners();
});

function setupEventListeners() {
    // Modal de creación
    document.getElementById('openCreateIncidentModal').addEventListener('click', () => {
        openModal('createIncidentModal');
    });

    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
        });
    });

    // Formulario de creación
    document.getElementById('createIncidentForm').addEventListener('submit', handleCreateIncident);

    // Filtros
    document.getElementById('searchIncident').addEventListener('input', filterIncidents);
    document.getElementById('filterIncidentStatus').addEventListener('change', filterIncidents);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

async function loadIncidents() {
    try {
        // Como no hay endpoint GET /incidents, usamos el dashboard para obtener datos
        const dashboard = await DashboardAPI.getOperationalData();
        
        // Crear array de incidencias a partir de los contadores (simulado)
        // En un sistema real, tendrías un endpoint GET /incidents
        allIncidents = generateMockIncidents(dashboard.incidents);
        
        renderIncidentsTable(allIncidents);
        updateIncidentStats(dashboard.incidents);
    } catch (error) {
        console.error('Error loading incidents:', error);
        showNotification('Error al cargar incidencias', 'error');
    }
}

function generateMockIncidents(stats) {
    // Esto es temporal hasta que tengas un endpoint GET /incidents
    const incidents = [];
    const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
    
    for (let i = 0; i < stats.open; i++) {
        incidents.push({
            id: `INC00${i}`,
            orderId: `ORD00${i}`,
            driverId: `DRV00${i}`,
            description: 'Incidencia de prueba',
            createdAt: new Date(),
            status: 'OPEN'
        });
    }
    
    for (let i = 0; i < stats.inProgress; i++) {
        incidents.push({
            id: `INC01${i}`,
            orderId: `ORD01${i}`,
            driverId: `DRV01${i}`,
            description: 'Incidencia en progreso',
            createdAt: new Date(),
            status: 'IN_PROGRESS'
        });
    }
    
    return incidents;
}

function renderIncidentsTable(incidents) {
    const tbody = document.getElementById('incidentsTableBody');
    
    if (!incidents || incidents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No hay incidencias registradas</td></tr>`;
        return;
    }

    tbody.innerHTML = incidents.map(incident => {
        const statusClass = incident.status.toLowerCase().replace('_', '-');
        
        return `
            <tr>
                <td>${incident.id}</td>
                <td>${incident.orderId}</td>
                <td>${incident.driverId}</td>
                <td>${incident.description}</td>
                <td>${Formatters.formatDate(incident.createdAt)}</td>
                <td><span class="status-badge ${statusClass}">${incident.status}</span></td>
                <td>
                    ${incident.status === 'OPEN' 
                        ? `<button class="action-btn" onclick="startIncident('${incident.id}')">Iniciar</button>` 
                        : ''}
                    ${incident.status === 'IN_PROGRESS' 
                        ? `<button class="action-btn" onclick="resolveIncident('${incident.id}')">Resolver</button>` 
                        : ''}
                    <button class="action-btn" onclick="viewIncidentDetails('${incident.id}')">Ver</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateIncidentStats(stats) {
    document.getElementById('openIncidentsCount').textContent = stats.open || 0;
    document.getElementById('inProgressCount').textContent = stats.inProgress || 0;
    document.getElementById('resolvedCount').textContent = stats.resolved || 0;
    
    // Calcular tiempo promedio (simulado)
    const total = (stats.open + stats.inProgress + stats.resolved) || 1;
    const avgTime = Math.round((stats.resolved * 2.5) / total * 10) / 10;
    document.getElementById('avgResolutionTime').textContent = `${avgTime}h`;
}

async function handleCreateIncident(e) {
    e.preventDefault();
    
    const incidentData = {
        id: document.getElementById('incidentId').value,
        driverId: document.getElementById('incidentDriverId').value,
        orderId: document.getElementById('incidentOrderId').value,
        description: document.getElementById('incidentDescription').value
    };

    try {
        await IncidentsAPI.create(incidentData);
        showNotification('Incidencia reportada exitosamente', 'success');
        closeModal('createIncidentModal');
        document.getElementById('createIncidentForm').reset();
        await loadIncidents(); // Recargar lista
    } catch (error) {
        console.error('Error creating incident:', error);
        showNotification('Error al reportar incidencia: ' + error.message, 'error');
    }
}

function filterIncidents() {
    const searchTerm = document.getElementById('searchIncident').value.toLowerCase();
    const statusFilter = document.getElementById('filterIncidentStatus').value;

    let filtered = allIncidents;

    if (searchTerm) {
        filtered = filtered.filter(i => 
            i.id.toLowerCase().includes(searchTerm) ||
            i.orderId.toLowerCase().includes(searchTerm) ||
            i.driverId.toLowerCase().includes(searchTerm) ||
            i.description.toLowerCase().includes(searchTerm)
        );
    }

    if (statusFilter !== 'all') {
        filtered = filtered.filter(i => i.status === statusFilter);
    }

    renderIncidentsTable(filtered);
}

async function startIncident(incidentId) {
    try {
        // Usar StartIncidentProgressUseCase
        await apiClient.patch(`/incidents/${incidentId}/start`, {});
        showNotification('Incidencia en progreso', 'success');
        await loadIncidents();
    } catch (error) {
        console.error('Error starting incident:', error);
        showNotification('Error al iniciar incidencia', 'error');
    }
}

async function resolveIncident(incidentId) {
    try {
        await IncidentsAPI.resolve(incidentId);
        showNotification('Incidencia resuelta', 'success');
        await loadIncidents();
    } catch (error) {
        console.error('Error resolving incident:', error);
        showNotification('Error al resolver incidencia', 'error');
    }
}

function viewIncidentDetails(incidentId) {
    const incident = allIncidents.find(i => i.id === incidentId);
    if (!incident) return;

    const modal = document.getElementById('incidentDetailsModal');
    const content = document.getElementById('incidentDetailsContent');
    
    content.innerHTML = `
        <h3>Detalles de Incidencia</h3>
        <p><strong>ID:</strong> ${incident.id}</p>
        <p><strong>Pedido:</strong> ${incident.orderId}</p>
        <p><strong>Conductor:</strong> ${incident.driverId}</p>
        <p><strong>Descripción:</strong> ${incident.description}</p>
        <p><strong>Fecha:</strong> ${Formatters.formatDate(incident.createdAt)}</p>
        <p><strong>Estado:</strong> <span class="status-badge ${incident.status.toLowerCase()}">${incident.status}</span></p>
    `;

    openModal('incidentDetailsModal');
}

// Reutilizar funciones de utilidades
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
window.startIncident = startIncident;
window.resolveIncident = resolveIncident;
window.viewIncidentDetails = viewIncidentDetails;
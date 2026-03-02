import { DriverRepository } from "../../domain/repositories/DriverRepository.js";
import { OrderRepository } from "../../domain/repositories/OrderRepository.js";
import { IncidentRepository } from "../../domain/repositories/IncidentRepository.js";
import { IncidentStatus } from "../../domain/enums/IncidentStatus.js";

export class GetOperationalDashboardUseCase {

  constructor(
    private driverRepository: DriverRepository,
    private orderRepository: OrderRepository,
    private incidentRepository: IncidentRepository
  ) {}

  execute() {
    // 1. Obtener todos los datos de los repositorios
    const drivers = this.driverRepository.findAll();
    const orders = this.orderRepository.findAll();
    const incidents = this.incidentRepository.findAll();

    // 2. Métricas de Conductores
    const totalDrivers = drivers.length;
    const availableDrivers = drivers.filter(d => d.isAvailable()).length;
    const activeDrivers = totalDrivers - availableDrivers;

    // 3. Métricas de Órdenes
    const totalOrders = orders.length;
    const assignedOrders = orders.filter(o => o.getAssignedDriver()).length;

    // FASE 12.2: Corrección Arquitectónica (Eliminamos el 'as any')
    // Ahora usamos el método público que respeta el encapsulamiento
    const deliveredOrdersCount = drivers
      .flatMap(d => d.getDeliveredOrders())
      .length;

    // 4. Métricas de Incidentes
    const openIncidents = incidents.filter(i => i.getStatus() === IncidentStatus.OPEN).length;
    const inProgressIncidents = incidents.filter(i => i.getStatus() === IncidentStatus.IN_PROGRESS).length;
    const resolvedIncidents = incidents.filter(i => i.getStatus() === IncidentStatus.RESOLVED).length;

    // 5. Retornar el objeto del Dashboard
    return {
      drivers: {
        total: totalDrivers,
        available: availableDrivers,
        active: activeDrivers
      },
      orders: {
        total: totalOrders,
        assigned: assignedOrders,
        delivered: deliveredOrdersCount
      },
      incidents: {
        open: openIncidents,
        inProgress: inProgressIncidents,
        resolved: resolvedIncidents
      }
    };
  }
}

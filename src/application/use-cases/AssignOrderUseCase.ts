import { OrderRepository } from "../../domain/repositories/OrderRepository.js";
import { DriverRepository } from "../../domain/repositories/DriverRepository.js";
import { OrderAssignmentService } from "../services/OrderAssignmentService.js";
import { AssignmentStrategy } from "../strategies/AssignmentStrategy.js";
import { EventBus } from "../events/EventBus.js";

export class AssignOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private driverRepository: DriverRepository,
    private strategy: AssignmentStrategy,
    private eventBus: EventBus // 10.2: Inyección de EventBus
  ) {}

  execute(orderId: string): void {
    const order = this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const drivers = this.driverRepository.findAll();
    const service = new OrderAssignmentService(this.strategy);

    // Realizamos la asignación lógica
    service.assignOrder(order, drivers);

    // Buscamos cuál de los conductores en memoria recibió la orden
    const assignedDriver = drivers.find(d => 
        d.getAssignedOrders().includes(orderId)
    );

    // 10.2: Si encontramos al conductor asignado, disparamos el evento
    if (assignedDriver) {
      this.eventBus.publish("ORDER_ASSIGNED", {
        orderId,
        driverId: assignedDriver.getId()
      });
    }
  }
}

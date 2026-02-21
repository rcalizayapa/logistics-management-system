import { OrderRepository } from "../../domain/repositories/OrderRepository.js";
import { DriverRepository } from "../../domain/repositories/DriverRepository.js";
import { OrderAssignmentService } from "../services/OrderAssignmentService.js";
import { AssignmentStrategy } from "../strategies/AssignmentStrategy.js";

export class AssignOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private driverRepository: DriverRepository,
    private strategy: AssignmentStrategy
  ) {}

  execute(orderId: string): void {
    const order = this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const drivers = this.driverRepository.findAll();

    const service = new OrderAssignmentService(this.strategy);

    service.assignOrder(order, drivers);
  }
}

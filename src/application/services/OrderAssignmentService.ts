import { Order } from "../../domain/entities/Order";
import { Driver } from "../../domain/entities/Driver";
import { AssignmentStrategy } from "../strategies/AssignmentStrategy";

export class OrderAssignmentService {
  constructor(private strategy: AssignmentStrategy) {}

  assignOrder(order: Order, drivers: Driver[]): void {
    const driver = this.strategy.assign(order, drivers);

    if (!driver) {
      throw new Error("No available drivers.");
    }

    order.assignDriver(driver.getId());
    driver.assignOrder(order.getId());
  }
}

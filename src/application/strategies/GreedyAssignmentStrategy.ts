import { AssignmentStrategy } from "./AssignmentStrategy.js";
import { Driver } from "../../domain/entities/Driver.js";
import { Order } from "../../domain/entities/Order.js";

export class GreedyAssignmentStrategy implements AssignmentStrategy {
  assign(order: Order, drivers: Driver[]): Driver | null {
    for (const driver of drivers) {
      if (driver.isAvailable()) {
        return driver;
      }
    }

    return null;
  }
}

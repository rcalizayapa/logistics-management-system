import { AssignmentStrategy } from "./AssignmentStrategy";
import { Driver } from "../../domain/entities/Driver";
import { Order } from "../../domain/entities/Order";

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

import { Driver } from "../../domain/entities/Driver.js";
import { Order } from "../../domain/entities/Order.js";

export interface AssignmentStrategy {
  assign(order: Order, drivers: Driver[]): Driver | null;
}

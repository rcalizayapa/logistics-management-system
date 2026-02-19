import { Driver } from "../../domain/entities/Driver";
import { Order } from "../../domain/entities/Order";

export interface AssignmentStrategy {
  assign(order: Order, drivers: Driver[]): Driver | null;
}

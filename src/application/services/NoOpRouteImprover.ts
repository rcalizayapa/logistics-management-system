import { Driver } from "../../domain/entities/Driver.js";
import { Order } from "../../domain/entities/Order.js";
import { IRouteImprover } from "../../domain/interfaces/IRouteImprover.js";

export class NoOpRouteImprover implements IRouteImprover {
  improve(driver: Driver, route: Order[]): Order[] {
    return route; // No modifica nada (temporal hasta 2-opt)
  }
}
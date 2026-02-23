import { Driver } from "../entities/Driver.js";
import { Order } from "../entities/Order.js";
import { IRouteImprover } from "../interfaces/IRouteImprover.js";

export class NoOpRouteImprover implements IRouteImprover {
  improve(driver: Driver, route: Order[]): Order[] {
    return route; // No modifica nada (temporal hasta 2-opt)
  }
}
import { Driver } from "../entities/Driver.js";
import { Order } from "../entities/Order.js";

export interface IRouteImprover {
  improve(driver: Driver, route: Order[]): Order[];
}
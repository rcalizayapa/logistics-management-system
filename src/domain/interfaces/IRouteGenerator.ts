import { Driver } from "../entities/Driver.js";
import { Order } from "../entities/Order.js";

export interface IRouteGenerator {
  generate(driver: Driver, orders: Order[]): Order[];
}
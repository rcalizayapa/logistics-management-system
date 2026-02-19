import { Order } from "../entities/Order.js";

export interface OrderRepository {
  save(order: Order): void;
  findById(id: string): Order | undefined;
  findAll(): Order[];
}

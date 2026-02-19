import { OrderRepository } from "../../domain/repositories/OrderRepository.js";
import { Order } from "../../domain/entities/Order.js";

export class OrderRepositoryMemory implements OrderRepository {
  private orders: Map<string, Order> = new Map();

  save(order: Order): void {
    this.orders.set(order.getId(), order);
  }

  findById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  findAll(): Order[] {
    return Array.from(this.orders.values());
  }
}

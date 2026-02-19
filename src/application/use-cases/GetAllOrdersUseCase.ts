import { OrderRepository } from "../../domain/repositories/OrderRepository.js";
import { Order } from "../../domain/entities/Order.js";

export class GetAllOrdersUseCase {
  constructor(private orderRepository: OrderRepository) {}

  execute(): Order[] {
    return this.orderRepository.findAll();
  }
}

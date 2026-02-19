import { Order } from "../../domain/entities/Order.js";
import { Location } from "../../domain/value-objects/Location.js";
import { DeliveryType } from "../../domain/enums/DeliveryType.js";
import { OrderRepository } from "../../domain/repositories/OrderRepository.js";

export class CreateOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  execute(
    id: string,
    latitude: number,
    longitude: number,
    address: string,
    deliveryType: DeliveryType,
    start: Date,
    end: Date
  ): Order {
    const location = new Location(latitude, longitude, address);

    const order = new Order(
      id,
      location,
      deliveryType,
      start,
      end
    );

    this.orderRepository.save(order);

    return order;
  }
}


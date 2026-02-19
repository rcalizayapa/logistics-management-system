import { Order } from "../../domain/entities/Order.js";
import { Location } from "../../domain/value-objects/Location.js";
import { DeliveryType } from "../../domain/enums/DeliveryType.js";

export class CreateOrderUseCase {
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

    return new Order(
      id,
      location,
      deliveryType,
      start,
      end
    );
  }
}

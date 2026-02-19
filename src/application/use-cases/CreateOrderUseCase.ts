import { Order } from "../../domain/entities/Order";
import { Location } from "../../domain/value-objects/Location";
import { DeliveryType } from "../../domain/enums/DeliveryType";

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

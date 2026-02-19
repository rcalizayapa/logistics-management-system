import { CreateOrderUseCase } from "../../application/use-cases/CreateOrderUseCase.js";
import { DeliveryType } from "../../domain/enums/DeliveryType.js";

export class OrderController {
  private createOrderUseCase = new CreateOrderUseCase();

  public create(reqBody: any) {
    const {
      id,
      latitude,
      longitude,
      address,
      deliveryType,
      start,
      end
    } = reqBody;

    const order = this.createOrderUseCase.execute(
      id,
      latitude,
      longitude,
      address,
      DeliveryType[deliveryType as keyof typeof DeliveryType],
      new Date(start),
      new Date(end)
    );

    return order;
  }
}

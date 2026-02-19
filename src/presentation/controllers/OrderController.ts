import { CreateOrderUseCase } from "../../application/use-cases/CreateOrderUseCase.js";
import { GetAllOrdersUseCase } from "../../application/use-cases/GetAllOrdersUseCase.js";
import { DeliveryType } from "../../domain/enums/DeliveryType.js";
import { OrderRepository } from "../../domain/repositories/OrderRepository.js";

export class OrderController {
  private createOrderUseCase: CreateOrderUseCase;
  private getAllOrdersUseCase: GetAllOrdersUseCase;

  constructor(orderRepository: OrderRepository) {
    this.createOrderUseCase = new CreateOrderUseCase(orderRepository);
    this.getAllOrdersUseCase = new GetAllOrdersUseCase(orderRepository);
  }

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

    return this.createOrderUseCase.execute(
      id,
      latitude,
      longitude,
      address,
      DeliveryType[deliveryType as keyof typeof DeliveryType],
      new Date(start),
      new Date(end)
    );
  }

  public getAll() {
    return this.getAllOrdersUseCase.execute();
  }
}


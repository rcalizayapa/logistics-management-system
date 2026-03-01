import { DriverRepository } from "../../domain/repositories/DriverRepository.js";
import { EventBus } from "../events/EventBus.js";

export class CompleteDeliveryUseCase {

  constructor(
    private driverRepository: DriverRepository,
    private eventBus: EventBus
  ) {}

  execute(driverId: string, orderId: string) {

    const driver = this.driverRepository.findById(driverId);

    if (!driver) {
      throw new Error("Driver not found");
    }

    driver.completeDelivery(orderId);

    this.eventBus.publish("DELIVERY_COMPLETED", {
      driverId,
      orderId
    });

    return { driverId, orderId };
  }
}
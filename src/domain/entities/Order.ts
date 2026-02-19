import { Location } from "../value-objects/Location.js";
import { DeliveryStatus } from "../enums/DeliveryStatus.js";
import { DeliveryType } from "../enums/DeliveryType.js";

export class Order {
  private status: DeliveryStatus;
  private assignedDriverId?: string;

  constructor(
    private readonly id: string,
    private readonly location: Location,
    private readonly deliveryType: DeliveryType,
    private readonly timeWindowStart: Date,
    private readonly timeWindowEnd: Date
  ) {
    this.status = DeliveryStatus.PENDING;
    this.validateTimeWindow();
  }

  private validateTimeWindow(): void {
    if (this.timeWindowStart >= this.timeWindowEnd) {
      throw new Error("Invalid delivery time window.");
    }
  }

  assignDriver(driverId: string): void {
    if (this.status !== DeliveryStatus.PENDING) {
      throw new Error("Order cannot be assigned.");
    }

    this.assignedDriverId = driverId;
  }

  markInTransit(): void {
    this.status = DeliveryStatus.IN_TRANSIT;
  }

  markDelivered(): void {
    this.status = DeliveryStatus.DELIVERED;
  }

  reportIncident(): void {
    this.status = DeliveryStatus.INCIDENT;
  }

  getId(): string {
    return this.id;
  }

  getStatus(): DeliveryStatus {
    return this.status;
  }

  getLocation(): Location {
    return this.location;
  }

  getAssignedDriver(): string | undefined {
    return this.assignedDriverId;
  }
}

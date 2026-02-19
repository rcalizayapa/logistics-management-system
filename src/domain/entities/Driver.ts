import { Location } from "../value-objects/Location.js";

export class Driver {
  private available: boolean = true;
  private assignedOrders: string[] = [];

  constructor(
    private readonly id: string,
    private name: string,
    private currentLocation: Location
  ) {}

  assignOrder(orderId: string): void {
    if (!this.available) {
      throw new Error("Driver is not available.");
    }

    this.assignedOrders.push(orderId);
  }

  setAvailability(status: boolean): void {
    this.available = status;
  }

  updateLocation(location: Location): void {
    this.currentLocation = location;
  }

  getId(): string {
    return this.id;
  }

  isAvailable(): boolean {
    return this.available;
  }

  getAssignedOrders(): string[] {
    return [...this.assignedOrders];
  }
}

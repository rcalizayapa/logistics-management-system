import { Location } from "../value-objects/Location.js";

export class Driver {
  private available: boolean = true;
  private assignedOrders: string[] = [];
  // 10.3: Nueva propiedad para el historial de entregas
  private deliveredOrders: string[] = [];

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

  // 10.3: Método de entrega según indicación (Domain limpio)
  public completeDelivery(orderId: string): void {
    this.deliveredOrders.push(orderId);
  }

  setAvailability(status: boolean): void {
    this.available = status;
  }

  public updateLocation(latitude: number, longitude: number): void {
    this.currentLocation = this.currentLocation.withCoordinates(latitude, longitude);
  }

  public setLocation(location: Location): void {
    this.currentLocation = location;
  }

  getId(): string { return this.id; }
  isAvailable(): boolean { return this.available; }
  getAssignedOrders(): string[] { return [...this.assignedOrders]; }
  getDeliveredOrders(): string[] { return [...this.deliveredOrders]; }
}


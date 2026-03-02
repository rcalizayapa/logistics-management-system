import { Location } from "../value-objects/Location.js";

export class Driver {
  private available: boolean = true;
  private assignedOrders: string[] = [];
  // 10.3: Historial de entregas realizadas
  private deliveredOrders: string[] = [];

  constructor(
    private readonly id: string,
    private name: string,
    private currentLocation: Location
  ) {}

  public assignOrder(orderId: string): void {
    if (!this.available) {
      throw new Error("Driver is not available.");
    }
    this.assignedOrders.push(orderId);
  }

  // 10.3: Registra la orden como entregada (Domain limpio)
  public completeDelivery(orderId: string): void {
    this.deliveredOrders.push(orderId);
  }

  // 12.2: Retorna una copia de las órdenes entregadas para el Dashboard
  public getDeliveredOrders(): string[] {
    return [...this.deliveredOrders];
  }

  public setAvailability(status: boolean): void {
    this.available = status;
  }

  public updateLocation(latitude: number, longitude: number): void {
    this.currentLocation = this.currentLocation.withCoordinates(latitude, longitude);
  }

  public setLocation(location: Location): void {
    this.currentLocation = location;
  }

  public getId(): string { return this.id; }
  public isAvailable(): boolean { return this.available; }
  public getAssignedOrders(): string[] { return [...this.assignedOrders]; }
}

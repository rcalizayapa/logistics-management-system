import { Order } from "./Order.js";

export class Route {
  constructor(
    private readonly driverId: string,
    private readonly orders: Order[],
    private readonly totalDistanceKm: number,
    private readonly estimatedTimeMinutes: number
  ) {}

  getDriverId(): string {
    return this.driverId;
  }

  getOrders(): Order[] {
    return [...this.orders];
  }

  getTotalDistance(): number {
    return this.totalDistanceKm;
  }

  getEstimatedTime(): number {
    return this.estimatedTimeMinutes;
  }
}
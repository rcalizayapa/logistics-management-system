import { DriverRepository } from "../../domain/repositories/DriverRepository.js";
import { OrderRepository } from "../../domain/repositories/OrderRepository.js";
import { RouteOptimizationService } from "../services/RouteOptimizationService.js";

export class GenerateDriverRouteUseCase {
  constructor(
    private driverRepository: DriverRepository,
    private orderRepository: OrderRepository,
    private routeOptimizationService: RouteOptimizationService
  ) {}

  execute(driverId: string) {
    const driver = this.driverRepository.findById(driverId);

    if (!driver) {
      throw new Error("Driver not found");
    }

    const orders = this.orderRepository
      .findAll()
      .filter(o => o.getAssignedDriver() === driverId);

    return this.routeOptimizationService.generateRoute(driver, orders);
  }
}
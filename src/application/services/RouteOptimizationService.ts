import { Driver } from "../../domain/entities/Driver.js";
import { Order } from "../../domain/entities/Order.js";
import { Route } from "../../domain/entities/Route.js";
import { IRouteGenerator } from "../../domain/interfaces/IRouteGenerator.js";
import { IRouteImprover } from "../../domain/interfaces/IRouteImprover.js";
import { DistanceCalculator } from "../../shared/utils/DistanceCalculator.js";

export class RouteOptimizationService {

  constructor(
    private generator: IRouteGenerator,
    private improver: IRouteImprover
  ) {}

  generateRoute(driver: Driver, orders: Order[]) {

    // 1️ Generar ruta inicial (Greedy)
    const initialRouteOrders = this.generator.generate(driver, orders);

    const initialDistance = this.calculateTotalDistance(driver, initialRouteOrders);

    // 2️ Mejorar con 2-opt
    const improvedOrders = this.improver.improve(driver, initialRouteOrders);

    const finalDistance = this.calculateTotalDistance(driver, improvedOrders);

    // 3️ Calcular métricas
    const improvementPercentage =
      initialDistance === 0
        ? 0
        : ((initialDistance - finalDistance) / initialDistance) * 100;

    const averageSpeedKmH = 40;
    const estimatedTime = (finalDistance / averageSpeedKmH) * 60;

    const route = new Route(
      driver.getId(),
      improvedOrders,
      Number(finalDistance.toFixed(2)),
      Number(estimatedTime.toFixed(2))
    );

    return {
      route,
      optimization: {
        initialDistance: Number(initialDistance.toFixed(2)),
        finalDistance: Number(finalDistance.toFixed(2)),
        improvementPercentage: Number(improvementPercentage.toFixed(2))
      }
    };
  }

  private calculateTotalDistance(driver: Driver, route: Order[]): number {

    const driverLocation = driver["currentLocation"];

    let totalDistance = 0;
    let currentLat = driverLocation.getLatitude();
    let currentLon = driverLocation.getLongitude();

    for (const order of route) {

      const orderLocation = order.getLocation();

      const distance = DistanceCalculator.calculateKm(
        currentLat,
        currentLon,
        orderLocation.getLatitude(),
        orderLocation.getLongitude()
      );

      totalDistance += distance;

      currentLat = orderLocation.getLatitude();
      currentLon = orderLocation.getLongitude();
    }

    return totalDistance;
  }
}
import { Driver } from "../../domain/entities/Driver.js";
import { Order } from "../../domain/entities/Order.js";
import { Route } from "../../domain/entities/Route.js";
import { IRouteGenerator } from "../../domain/interfaces/IRouteGenerator.js";
import { IRouteImprover } from "../../domain/interfaces/IRouteImprover.js";
import { DistanceCalculator } from "../../shared/utils/DistanceCalculator.js";
import { RouteHistoryRepositoryMemory } from "../../infrastructure/repositories/RouteHistoryRepositoryMemory.js";

export class RouteOptimizationService {

  constructor(
    private generator: IRouteGenerator,
    private improver: IRouteImprover,
    private routeHistoryRepository: RouteHistoryRepositoryMemory 
  ) {}

  generateRoute(driver: Driver, orders: Order[]) {

    const initialRouteOrders = this.generator.generate(driver, orders);
    const initialDistance = this.calculateTotalDistance(driver, initialRouteOrders);

    const improvedOrders = this.improver.improve(driver, initialRouteOrders);
    const finalDistance = this.calculateTotalDistance(driver, improvedOrders);

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

    // CORRECCIÓN AQUÍ: Transformamos el array de Order[] a Location[]
    // Usamos .map para obtener solo el objeto Location de cada orden
    const routeLocations = improvedOrders.map(order => order.getLocation());

    // FASE 10.5: Guardar en el historial usando el formato correcto
    this.routeHistoryRepository.save({
      driverId: driver.getId(),
      route: routeLocations, // Ahora sí es de tipo Location[]
      timestamp: new Date(),
      type: "GENERATED" // Agregado para coincidir con tu interfaz RouteHistoryEntry
    });

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
    const driverLocation = (driver as any).currentLocation;

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

import { Driver } from "../../domain/entities/Driver.js";
import { Order } from "../../domain/entities/Order.js";
import { Route } from "../../domain/entities/Route.js";
import { IRouteGenerator } from "../../domain/interfaces/IRouteGenerator.js";
import { IRouteImprover } from "../../domain/interfaces/IRouteImprover.js";
import { DistanceCalculator } from "../../shared/utils/DistanceCalculator.js";

export class RouteOptimizationService {

  constructor(
    private readonly generator: IRouteGenerator,
    private readonly improver: IRouteImprover
  ) {}

  generateRoute(driver: Driver, orders: Order[]): Route {

    // 1️⃣ Generar ruta inicial
    const generatedOrders = this.generator.generate(driver, orders);

    // 2️⃣ Mejorar ruta
    const improvedOrders = this.improver.improve(driver, generatedOrders);

    // 3️⃣ Calcular métricas finales
    const driverLocation = driver["currentLocation"];
    let currentLat = driverLocation.getLatitude();
    let currentLon = driverLocation.getLongitude();
    let totalDistance = 0;

    for (const order of improvedOrders) {
      const location = order.getLocation();

      const distance = DistanceCalculator.calculateKm(
        currentLat,
        currentLon,
        location.getLatitude(),
        location.getLongitude()
      );

      totalDistance += distance;
      currentLat = location.getLatitude();
      currentLon = location.getLongitude();
    }

    const averageSpeedKmH = 40;
    const estimatedTime = (totalDistance / averageSpeedKmH) * 60;

    return new Route(
      driver.getId(),
      improvedOrders,
      Number(totalDistance.toFixed(2)),
      Number(estimatedTime.toFixed(2))
    );
  }
}
import { Driver } from "../../domain/entities/Driver.js";
import { Order } from "../../domain/entities/Order.js";
import { IRouteImprover } from "../../domain/interfaces/IRouteImprover.js";
import { DistanceCalculator } from "../../shared/utils/DistanceCalculator.js";

export class TwoOptRouteImprover implements IRouteImprover {

  improve(driver: Driver, route: Order[]): Order[] {

    let improved = true;
    let bestRoute = [...route];

    while (improved) {
      improved = false;

      for (let i = 1; i < bestRoute.length - 1; i++) {
        for (let j = i + 1; j < bestRoute.length; j++) {

          const newRoute = this.twoOptSwap(bestRoute, i, j);

          const currentDistance = this.calculateTotalDistance(driver, bestRoute);
          const newDistance = this.calculateTotalDistance(driver, newRoute);

          if (newDistance < currentDistance) {
            bestRoute = newRoute;
            improved = true;
          }
        }
      }
    }

    return bestRoute;
  }

  private twoOptSwap(route: Order[], i: number, j: number): Order[] {
    return [
      ...route.slice(0, i),
      ...route.slice(i, j + 1).reverse(),
      ...route.slice(j + 1)
    ];
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
import { Driver } from "../entities/Driver.js";
import { Order } from "../entities/Order.js";
import { IRouteGenerator } from "../interfaces/IRouteGenerator.js";
import { DistanceCalculator } from "../../shared/utils/DistanceCalculator.js";

export class GreedyRouteGenerator implements IRouteGenerator {

  generate(driver: Driver, orders: Order[]): Order[] {

    const driverLocation = driver["currentLocation"];

    let remainingOrders = [...orders];
    let currentLat = driverLocation.getLatitude();
    let currentLon = driverLocation.getLongitude();

    const optimizedOrders: Order[] = [];

    while (remainingOrders.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      for (let i = 0; i < remainingOrders.length; i++) {
        const orderLocation = remainingOrders[i].getLocation();

        const distance = DistanceCalculator.calculateKm(
          currentLat,
          currentLon,
          orderLocation.getLatitude(),
          orderLocation.getLongitude()
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      const nextOrder = remainingOrders.splice(nearestIndex, 1)[0];

      optimizedOrders.push(nextOrder);

      currentLat = nextOrder.getLocation().getLatitude();
      currentLon = nextOrder.getLocation().getLongitude();
    }

    return optimizedOrders;
  }
}
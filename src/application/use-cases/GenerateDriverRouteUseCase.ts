import { DriverRepository } from "../../domain/repositories/DriverRepository.js";
import { OrderRepository } from "../../domain/repositories/OrderRepository.js";
import { GreedyStrategy } from "../services/optimization/GreedyStrategy.js";
import { TwoOptStrategy } from "../services/optimization/TwoOptStrategy.js";
import { RouteOptimizer } from "../services/optimization/RouteOptimizer.js";

export class GenerateDriverRouteUseCase {
  constructor(
    private driverRepository: DriverRepository,
    private orderRepository: OrderRepository
  ) {}

  execute(driverId: string) {
    const driver = this.driverRepository.findById(driverId);

    if (!driver) {
      throw new Error("Driver not found");
    }

    // 1. Obtener los pedidos asignados al conductor
    const orders = this.orderRepository
      .findAll()
      .filter(o => o.getAssignedDriver() === driverId);

    if (orders.length === 0) {
        return []; // O manejar como prefieras si no hay pedidos
    }

    // 2. REEMPLAZO: Configurar el optimizador con la estrategia inicial (Greedy)
    const greedy = new GreedyStrategy();
    const optimizer = new RouteOptimizer(greedy);

    // 3. Generar la ruta inicial (Voraz)
    let route = optimizer.optimize(orders);

    // 4. Refinar la ruta usando una estrategia más avanzada (2-opt)
    optimizer.setStrategy(new TwoOptStrategy());
    route = optimizer.optimize(route);

    return route;
  }
}

//No tocar -->//
import http, { IncomingMessage, ServerResponse } from "node:http"; //-->No tocar
import { OrderController } from "../../presentation/controllers/OrderController.js";
import { DriverController } from "../../presentation/controllers/DriverController.js";
import { OrderRepositoryMemory } from "../repositories/OrderRepositoryMemory.js";
import { DriverRepositoryMemory } from "../repositories/DriverRepositoryMemory.js";
import { GreedyAssignmentStrategy } from "../../application/strategies/GreedyAssignmentStrategy.js";
import { AssignOrderUseCase } from "../../application/use-cases/AssignOrderUseCase.js";
import { GenerateDriverRouteUseCase } from "../../application/use-cases/GenerateDriverRouteUseCase.js";
import { RouteOptimizationService } from "../../application/services/RouteOptimizationService.js";
import { GreedyRouteGenerator } from "../../application/services/GreedyRouteGenerator.js";
import { NoOpRouteImprover } from "../../application/services/NoOpRouteImprover.js";

export class HttpServer {
  private orderRepository = new OrderRepositoryMemory();
  private driverRepository = new DriverRepositoryMemory();

  private orderController = new OrderController(this.orderRepository);
  private driverController = new DriverController(this.driverRepository);

  private strategy = new GreedyAssignmentStrategy();
  private assignOrderUseCase = new AssignOrderUseCase(
    this.orderRepository,
    this.driverRepository,
    this.strategy
  );
  private routeGenerator = new GreedyRouteGenerator();
  private routeImprover = new NoOpRouteImprover();

  private routeOptimizationService = new RouteOptimizationService(
    this.routeGenerator,
    this.routeImprover
  );

  private generateRouteUseCase = new GenerateDriverRouteUseCase(
    this.driverRepository,
    this.orderRepository,
    this.routeOptimizationService
  );

  private server = http.createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      await this.requestListener(req, res);
    }
  );

  constructor(private port: number) {}

  private async requestListener(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    res.setHeader("Content-Type", "application/json");

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      const parsedBody = body ? JSON.parse(body) : {};

      // ORDERS
      if (req.url === "/orders" && req.method === "POST") {
        const order = this.orderController.create(parsedBody);
        res.statusCode = 201;
        res.end(JSON.stringify(order));
        return;
      }

      if (req.url === "/orders" && req.method === "GET") {
        res.statusCode = 200;
        res.end(JSON.stringify(this.orderController.getAll()));
        return;
      }

      if (req.url === "/orders/assign" && req.method === "POST") {
        this.assignOrderUseCase.execute(parsedBody.orderId);
        res.statusCode = 200;
        res.end(JSON.stringify({ message: "Order assigned successfully" }));
        return;
      }

      // DRIVERS
      if (req.url === "/drivers" && req.method === "POST") {
        const driver = this.driverController.create(parsedBody);
        res.statusCode = 201;
        res.end(JSON.stringify(driver));
        return;
      }

      if (req.url === "/drivers" && req.method === "GET") {
        res.statusCode = 200;
        res.end(JSON.stringify(this.driverController.getAll()));
        return;
      }

      if (req.url?.startsWith("/drivers/") && req.method === "GET") {
        const parts = req.url.split("/");
        const driverId = parts[2];

        const route = this.generateRouteUseCase.execute(driverId);

        res.statusCode = 200;
        res.end(JSON.stringify(route));
        return;
      }

      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Route not found" }));
    });
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}



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
import { TwoOptRouteImprover } from "../../application/services/TwoOptRouteImprover.js";
import { UpdateDriverLocationUseCase } from "../../application/use-cases/UpdateDriverLocationUseCase.js";
import { EventBus } from "../../application/events/EventBus.js";
import { CompleteDeliveryUseCase } from "../../application/use-cases/CompleteDeliveryUseCase.js";
import { RouteHistoryRepositoryMemory } from "../repositories/RouteHistoryRepositoryMemory.js";
import { IncidentRepositoryMemory } from "../repositories/IncidentRepositoryMemory.js";
import { CreateIncidentUseCase } from "../../application/use-cases/CreateIncidentUseCase.js";
import { StartIncidentProgressUseCase } from "../../application/use-cases/StartIncidentProgressUseCase.js";
import { ResolveIncidentUseCase } from "../../application/use-cases/ResolveIncidentUseCase.js";
import { GetOperationalDashboardUseCase } from "../../application/use-cases/GetOperationalDashboardUseCase.js";
import { IncidentController } from "../../presentation/controllers/IncidentController.js";

export class HttpServer {
  private orderRepository = new OrderRepositoryMemory();
  private driverRepository = new DriverRepositoryMemory();
  private routeHistoryRepository = new RouteHistoryRepositoryMemory();
  private incidentRepository = new IncidentRepositoryMemory();

  private eventBus = new EventBus();

  private orderController = new OrderController(this.orderRepository);
  private driverController = new DriverController(this.driverRepository);

  private strategy = new GreedyAssignmentStrategy();

  private assignOrderUseCase = new AssignOrderUseCase(
    this.orderRepository,
    this.driverRepository,
    this.strategy,
    this.eventBus
  );

  private routeGenerator = new GreedyRouteGenerator();
  private routeImprover = new TwoOptRouteImprover();

  private routeOptimizationService = new RouteOptimizationService(
    this.routeGenerator,
    this.routeImprover,
    this.routeHistoryRepository
  );

  private updateDriverLocationUseCase =
    new UpdateDriverLocationUseCase(this.driverRepository);

  private completeDeliveryUseCase =
    new CompleteDeliveryUseCase(this.driverRepository, this.eventBus);

  private createIncidentUseCase =
    new CreateIncidentUseCase(this.incidentRepository, this.eventBus);

  private startIncidentProgressUseCase =
    new StartIncidentProgressUseCase(this.incidentRepository, this.eventBus);

  private resolveIncidentUseCase =
    new ResolveIncidentUseCase(this.incidentRepository, this.eventBus);

  // Instanciamos los controladores necesarios para las nuevas rutas
  private incidentController = new IncidentController(
    this.createIncidentUseCase,
    this.resolveIncidentUseCase
  );

  private driverStreams: Map<string, ServerResponse[]> = new Map();
  private monitorStreams: ServerResponse[] = [];

  private generateRouteUseCase = new GenerateDriverRouteUseCase(
    this.driverRepository,
    this.orderRepository,
    this.routeOptimizationService
  );

  private getOperationalDashboardUseCase =
    new GetOperationalDashboardUseCase(
      this.driverRepository,
      this.orderRepository,
      this.incidentRepository
    );

  private server = http.createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      await this.requestListener(req, res);
    }
  );

  constructor(private port: number) {
    this.eventBus.subscribe("DRIVER_LOCATION_UPDATED", payload => {
      this.broadcast({ type: "LOCATION", ...payload });
    });

    this.eventBus.subscribe("ORDER_ASSIGNED", payload => {
      this.broadcast({ type: "ASSIGNMENT", ...payload });
    });

    this.eventBus.subscribe("DELIVERY_COMPLETED", payload => {
      this.broadcast({ type: "DELIVERY", ...payload });
    });

    this.eventBus.subscribe("INCIDENT_CREATED", payload => {
      this.broadcast(payload);
    });

    this.eventBus.subscribe("INCIDENT_UPDATED", payload => {
      this.broadcast(payload);
    });

    this.eventBus.subscribe("INCIDENT_RESOLVED", payload => {
      this.broadcast(payload);
    });
  }

  private broadcast(payload: any): void {
    for (const stream of this.monitorStreams) {
      stream.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  }

  private async requestListener(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    
    if (req.url === "/monitor" && req.method === "GET") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      });
      this.monitorStreams.push(res);
      req.on("close", () => {
        this.monitorStreams = this.monitorStreams.filter(s => s !== res);
      });
      return;
    }

    if (req.url?.startsWith("/drivers/") && req.url?.endsWith("/stream") && req.method === "GET") {
      const parts = req.url.split("/");
      const driverId = parts[2] as string;
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });
      if (!this.driverStreams.has(driverId)) this.driverStreams.set(driverId, []);
      this.driverStreams.get(driverId)!.push(res);
      req.on("close", () => {
        const streams = this.driverStreams.get(driverId);
        if (streams) this.driverStreams.set(driverId, streams.filter(s => s !== res));
      });
      return; 
    }

    res.setHeader("Content-Type", "application/json");

    let body = "";
    req.on("data", (chunk) => { body += chunk; });

    req.on("end", async () => {
      const parsedBody = body ? JSON.parse(body) : {};

      // 11.5: ENDPOINT DASHBOARD (Indicación app.get("/dashboard"))
      if (req.url === "/dashboard" && req.method === "GET") {
        const summary = this.getOperationalDashboardUseCase.execute();
        res.statusCode = 200;
        res.end(JSON.stringify(summary));
        return;
      }

      // 11.5: ENDPOINT CREAR INCIDENTE (Indicación app.post("/incidents"))
      if (req.url === "/incidents" && req.method === "POST") {
        // Adaptamos para usar el método del controlador solicitado
        const customReq = { body: parsedBody };
        const customRes = {
          status: (code: number) => ({
            json: (data: any) => {
              res.statusCode = code;
              res.end(JSON.stringify(data));
            }
          })
        };
        await this.incidentController.createIncident(customReq as any, customRes as any);
        return;
      }

      // 11.5: ENDPOINT RESOLVER INCIDENTE (Indicación app.patch("/incidents/:incidentId/resolve"))
      if (req.url?.startsWith("/incidents/") && req.url?.endsWith("/resolve") && req.method === "PATCH") {
        const parts = req.url.split("/");
        const incidentId = parts[2];
        
        const customReq = { params: { incidentId } };
        const customRes = {
          status: (code: number) => ({
            json: (data: any) => {
              res.statusCode = code;
              res.end(JSON.stringify(data));
            }
          })
        };
        await this.incidentController.resolveIncident(customReq as any, customRes as any);
        return;
      }

      // --- RUTAS EXISTENTES ---
      if (req.url === "/orders" && req.method === "POST") {
        res.statusCode = 201;
        res.end(JSON.stringify(this.orderController.create(parsedBody)));
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
      if (req.url === "/drivers" && req.method === "POST") {
        res.statusCode = 201;
        res.end(JSON.stringify(this.driverController.create(parsedBody)));
        return;
      }
      if (req.url === "/drivers" && req.method === "GET") {
        res.statusCode = 200;
        res.end(JSON.stringify(this.driverController.getAll()));
        return;
      }
      if (req.url?.startsWith("/drivers/") && req.url?.endsWith("/location") && req.method === "POST") {
        const parts = req.url.split("/");
        const driverId = parts[2] as string;
        const updated = this.updateDriverLocationUseCase.execute(driverId, parsedBody.latitude, parsedBody.longitude);
        const streams = this.driverStreams.get(driverId);
        if (streams) streams.forEach(s => s.write(`data: ${JSON.stringify(updated)}\n\n`));
        res.statusCode = 200;
        res.end(JSON.stringify(updated));
        return;
      }
      if (req.url?.startsWith("/drivers/") && req.url?.endsWith("/deliver") && req.method === "POST") {
        const parts = req.url.split("/");
        const driverId = parts[2] as string;
        res.statusCode = 200;
        res.end(JSON.stringify(this.completeDeliveryUseCase.execute(driverId, parsedBody.orderId)));
        return;
      }
      if (req.url?.startsWith("/drivers/") && req.method === "GET") {
        const parts = req.url.split("/");
        const driverId = parts[2] as string;
        res.statusCode = 200;
        res.end(JSON.stringify(this.generateRouteUseCase.execute(driverId)));
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


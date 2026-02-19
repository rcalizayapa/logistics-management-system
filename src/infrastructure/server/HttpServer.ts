//No tocar -->//
import http, { IncomingMessage, ServerResponse } from "node:http"; //-->No tocar
import { OrderController } from "../../presentation/controllers/OrderController.js";

export class HttpServer {
  private orderController = new OrderController();

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

    if (req.url === "/health" && req.method === "GET") {
      res.statusCode = 200;
      res.end(JSON.stringify({ status: "OK" }));
      return;
    }

    if (req.url === "/orders" && req.method === "POST") {
      let body = "";

      req.on("data", chunk => {
        body += chunk;
      });

      req.on("end", () => {
        const parsedBody = JSON.parse(body);

        const order = this.orderController.create(parsedBody);

        res.statusCode = 201;
        res.end(JSON.stringify(order));
      });

      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Route not found" }));
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}


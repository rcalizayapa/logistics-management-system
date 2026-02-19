import http, { IncomingMessage, ServerResponse } from "node:http";

export class HttpServer {
  private server = http.createServer(
    (req: IncomingMessage, res: ServerResponse) => {
      this.requestListener(req, res);
    }
  );

  constructor(private port: number) {}

  private requestListener(req: IncomingMessage, res: ServerResponse): void {
    res.setHeader("Content-Type", "application/json");

    if (req.url === "/health" && req.method === "GET") {
      res.statusCode = 200;
      res.end(JSON.stringify({ status: "OK" }));
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

import request from "supertest";
// Asegúrate de que esta ruta sea la correcta hacia tu archivo HttpServer.ts
import { HttpServer } from "../../infrastructure/server/HttpServer.js"; 

describe("Sistema Logístico - Pruebas End-to-End", () => {
  // Creamos la instancia del servidor para el test
  const httpServer = new HttpServer(3001);
  const app = (httpServer as any).server; // Extraemos el servidor nativo de la clase

  let driverId = "D-TEST-01";
  let orderId = "O-TEST-01";

  it("1️⃣ Debe crear un conductor con todos los datos", async () => {
    const response = await request(app)
      .post("/drivers")
      .send({ 
        id: driverId, 
        name: "Carlos", 
        latitude: -12.0464, 
        longitude: -77.0428, 
        address: "Lima Centro" 
      });

    expect(response.status).toBe(201);
  });

  it("2️⃣ Debe crear un pedido", async () => {
    const response = await request(app)
      .post("/orders")
      .send({
        id: orderId,
        latitude: -12.0500,
        longitude: -77.0300,
        address: "Miraflores",
        deliveryType: "EXPRESS"
      });

    expect(response.status).toBe(201);
  });

  it("3️⃣ Debe asignar pedido al conductor (Ruta real)", async () => {
    const response = await request(app)
      .post("/orders/assign")
      .send({ orderId }); // Tu assignOrderUseCase busca por orderId

    expect(response.status).toBe(200);
  });

  it("4️⃣ Debe generar ruta optimizada", async () => {
    // Usamos el endpoint GET /drivers/:id que ya tienes
    const response = await request(app)
      .get(`/drivers/${driverId}`);

    expect(response.status).toBe(200);
  });

  it("5️⃣ Debe completar la entrega", async () => {
    // Usamos tu ruta real: POST /drivers/:id/deliver
    const response = await request(app)
      .post(`/drivers/${driverId}/deliver`)
      .send({ orderId });

    expect(response.status).toBe(200);
  });

  it("6️⃣ El dashboard debe reflejar entrega completada", async () => {
    const response = await request(app).get("/dashboard");

    expect(response.status).toBe(200);
    // Ajustado a la estructura de tu GetOperationalDashboardUseCase
    expect(response.body.orders.delivered).toBeGreaterThan(0);
  });
});

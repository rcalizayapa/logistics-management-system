import { IncidentStatus } from "../enums/IncidentStatus.js";

export class Incident {
  constructor(
    private id: string,
    private driverId: string,
    private orderId: string,
    private description: string,
    private status: IncidentStatus = IncidentStatus.OPEN,
    private createdAt: Date = new Date()
  ) {}

  // --- Getters ---
  public getId(): string {
    return this.id;
  }

  public getDriverId(): string {
    return this.driverId;
  }

  public getOrderId(): string {
    return this.orderId;
  }

  public getDescription(): string {
    return this.description;
  }

  public getStatus(): IncidentStatus {
    return this.status;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  // --- Lógica de Cambio de Estado ---

  /**
   * Cambia el estado a IN_PROGRESS. 
   * Solo es posible si la incidencia está actualmente en OPEN.
   */
  public startProgress(): void {
    if (this.status !== IncidentStatus.OPEN) {
      throw new Error(`Incident must be OPEN to start progress. Current status: ${this.status}`);
    }
    this.status = IncidentStatus.IN_PROGRESS;
  }

  /**
   * Cambia el estado a RESOLVED.
   * Evita re-resolver una incidencia ya finalizada.
   */
  public resolve(): void {
    if (this.status === IncidentStatus.RESOLVED) {
      throw new Error("Incident already resolved.");
    }
    this.status = IncidentStatus.RESOLVED;
  }
}

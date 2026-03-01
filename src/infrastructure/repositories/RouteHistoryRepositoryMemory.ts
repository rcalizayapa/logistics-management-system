import { Location } from "../../domain/value-objects/Location.js";

// Definimos la estructura de lo que vamos a almacenar
export interface RouteHistoryEntry {
  driverId: string;
  route: Location[];
  timestamp: Date;
  type: "GENERATED" | "COMPLETED"; // Para saber si fue una planificación o un viaje terminado
}

export class RouteHistoryRepositoryMemory {
  private history: RouteHistoryEntry[] = [];

  /**
   * Guarda un nuevo registro en el historial
   */
  async save(entry: RouteHistoryEntry): Promise<void> {
    this.history.push(entry);
    // Podríamos usar el FileIO que creamos al principio para persistirlo en un .txt si quisieras
  }

  /**
   * Recupera todo el historial de un conductor específico
   */
  async findByDriverId(driverId: string): Promise<RouteHistoryEntry[]> {
    return this.history.filter(entry => entry.driverId === driverId);
  }

  /**
   * Recupera todo el historial del sistema
   */
  async findAll(): Promise<RouteHistoryEntry[]> {
    return [...this.history];
  }
}

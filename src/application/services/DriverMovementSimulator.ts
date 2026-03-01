import { Driver } from "../../domain/entities/Driver.js";
import { Location } from "../../domain/value-objects/Location.js";
import { UpdateDriverLocationUseCase } from "../use-cases/UpdateDriverLocationUseCase.js";

export class DriverMovementSimulator {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private updateDriverLocationUseCase: UpdateDriverLocationUseCase
  ) {}

  /**
   * Simula el movimiento de un conductor a través de una lista de ubicaciones (ruta).
   */
  public startSimulation(driver: Driver, route: Location[]): void {
    const driverId = driver.getId();

    // Si ya existe una simulación para este driver, la detenemos
    this.stopSimulation(driverId);

    let currentIndex = 0;

    // FASE 5: Usa setInterval para mover coordenadas cada 2 segundos
    const interval = setInterval(() => {
      if (currentIndex >= route.length) {
        this.stopSimulation(driverId);
        return;
      }

      const nextLocation = route[currentIndex];

      // FASE 5: llama a UpdateDriverLocationUseCase (esto emite los eventos automáticamente)
      this.updateDriverLocationUseCase.execute(
        driverId,
        nextLocation.getLatitude(),
        nextLocation.getLongitude()
      );

      currentIndex++;
    }, 2000); // 2 segundos

    this.intervals.set(driverId, interval);
  }

  public stopSimulation(driverId: string): void {
    if (this.intervals.has(driverId)) {
      clearInterval(this.intervals.get(driverId)!);
      this.intervals.delete(driverId);
    }
  }
}

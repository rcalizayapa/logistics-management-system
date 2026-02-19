import { DriverRepository } from "../../domain/repositories/DriverRepository.js";
import { Driver } from "../../domain/entities/Driver.js";

export class DriverRepositoryMemory implements DriverRepository {
  private drivers: Map<string, Driver> = new Map();

  save(driver: Driver): void {
    this.drivers.set(driver.getId(), driver);
  }

  findById(id: string): Driver | undefined {
    return this.drivers.get(id);
  }

  findAll(): Driver[] {
    return Array.from(this.drivers.values());
  }
}

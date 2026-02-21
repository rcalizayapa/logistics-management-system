import { DriverRepository } from "../../domain/repositories/DriverRepository.js";
import { Driver } from "../../domain/entities/Driver.js";

export class GetAllDriversUseCase {
  constructor(private driverRepository: DriverRepository) {}

  execute(): Driver[] {
    return this.driverRepository.findAll();
  }
}

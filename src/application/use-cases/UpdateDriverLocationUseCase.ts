import { DriverRepository } from "../../domain/repositories/DriverRepository.js";

export class UpdateDriverLocationUseCase {

  constructor(private driverRepository: DriverRepository) {}

  execute(driverId: string, latitude: number, longitude: number) {

    const driver = this.driverRepository.findById(driverId);

    if (!driver) {
      throw new Error("Driver not found");
    }

    driver.updateLocation(latitude, longitude);

    return {
      driverId,
      latitude,
      longitude
    };
  }
}
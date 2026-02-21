import { Driver } from "../../domain/entities/Driver.js";
import { Location } from "../../domain/value-objects/Location.js";
import { DriverRepository } from "../../domain/repositories/DriverRepository.js";

export class CreateDriverUseCase {
  constructor(private driverRepository: DriverRepository) {}

  execute(
    id: string,
    name: string,
    latitude: number,
    longitude: number,
    address: string
  ): Driver {
    const location = new Location(latitude, longitude, address);

    const driver = new Driver(id, name, location);

    this.driverRepository.save(driver);

    return driver;
  }
}

import { Driver } from "../../domain/entities/Driver.js";
import { Location } from "../../domain/value-objects/Location.js";

export class CreateDriverUseCase {
  execute(
    id: string,
    name: string,
    latitude: number,
    longitude: number,
    address: string
  ): Driver {
    const location = new Location(latitude, longitude, address);

    return new Driver(id, name, location);
  }
}

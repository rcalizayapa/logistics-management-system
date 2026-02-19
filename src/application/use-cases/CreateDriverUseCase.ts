import { Driver } from "../../domain/entities/Driver";
import { Location } from "../../domain/value-objects/Location";

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

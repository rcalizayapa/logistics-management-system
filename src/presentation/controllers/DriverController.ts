import { CreateDriverUseCase } from "../../application/use-cases/CreateDriverUseCase.js";
import { GetAllDriversUseCase } from "../../application/use-cases/GetAllDriversUseCase.js";
import { DriverRepository } from "../../domain/repositories/DriverRepository.js";

export class DriverController {
  private createDriverUseCase: CreateDriverUseCase;
  private getAllDriversUseCase: GetAllDriversUseCase;

  constructor(driverRepository: DriverRepository) {
    this.createDriverUseCase = new CreateDriverUseCase(driverRepository);
    this.getAllDriversUseCase = new GetAllDriversUseCase(driverRepository);
  }

  public create(reqBody: any) {
    const { id, name, latitude, longitude, address } = reqBody;

    return this.createDriverUseCase.execute(
      id,
      name,
      latitude,
      longitude,
      address
    );
  }

  public getAll() {
    return this.getAllDriversUseCase.execute();
  }
}

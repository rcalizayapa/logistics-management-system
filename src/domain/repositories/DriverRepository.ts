import { Driver } from "../entities/Driver.js";

export interface DriverRepository {
  save(driver: Driver): void;
  findById(id: string): Driver | undefined;
  findAll(): Driver[];
}
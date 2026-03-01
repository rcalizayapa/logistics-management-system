import { Incident } from "../entities/Incident.js";

export interface IncidentRepository {
  save(incident: Incident): void;
  findById(id: string): Incident | undefined;
  findAll(): Incident[];
}
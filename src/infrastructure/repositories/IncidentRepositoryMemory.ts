import { Incident } from "../../domain/entities/Incident.js";
import { IncidentRepository } from "../../domain/repositories/IncidentRepository.js";

export class IncidentRepositoryMemory implements IncidentRepository {

  private incidents: Incident[] = [];

  save(incident: Incident): void {
    const index = this.incidents.findIndex(i => i.getId() === incident.getId());

    if (index >= 0) {
      this.incidents[index] = incident;
    } else {
      this.incidents.push(incident);
    }
  }

  findById(id: string): Incident | undefined {
    return this.incidents.find(i => i.getId() === id);
  }

  findAll(): Incident[] {
    return this.incidents;
  }
}
import { IncidentRepository } from "../../domain/repositories/IncidentRepository.js";
import { EventBus } from "../events/EventBus.js";

export class StartIncidentProgressUseCase {

  constructor(
    private incidentRepository: IncidentRepository,
    private eventBus: EventBus
  ) {}

  execute(incidentId: string) {

    const incident = this.incidentRepository.findById(incidentId);

    if (!incident) {
      throw new Error("Incident not found");
    }

    incident.startProgress();
    this.incidentRepository.save(incident);

    this.eventBus.publish("INCIDENT_UPDATED", {
      incidentId,
      status: incident.getStatus()
    });

    return incident;
  }
}
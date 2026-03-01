import { Incident } from "../../domain/entities/Incident.js";
import { IncidentRepository } from "../../domain/repositories/IncidentRepository.js";
import { EventBus } from "../events/EventBus.js";

export class CreateIncidentUseCase {

  constructor(
    private incidentRepository: IncidentRepository,
    private eventBus: EventBus
  ) {}

  execute(
    id: string,
    driverId: string,
    orderId: string,
    description: string
  ) {

    const incident = new Incident(
      id,
      driverId,
      orderId,
      description
    );

    this.incidentRepository.save(incident);

    this.eventBus.publish("INCIDENT_CREATED", {
      incidentId: id,
      driverId,
      orderId,
      description,
      status: incident.getStatus()
    });

    return incident;
  }
}
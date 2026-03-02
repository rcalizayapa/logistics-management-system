import { CreateIncidentUseCase } from "../../application/use-cases/CreateIncidentUseCase.js";
import { ResolveIncidentUseCase } from "../../application/use-cases/ResolveIncidentUseCase.js";

export class IncidentController {
  constructor(
    private readonly createIncidentUseCase: CreateIncidentUseCase,
    private readonly resolveIncidentUseCase: ResolveIncidentUseCase
  ) {}

  async createIncident(req: any, res: any): Promise<void> {
    try {
      // CORRECCIÓN: Extraemos los 4 campos necesarios del body
      const { id, driverId, orderId, description } = req.body;

      // Enviamos los 4 argumentos requeridos por el UseCase
      const incident = await this.createIncidentUseCase.execute(
        id, 
        driverId, 
        orderId, 
        description
      );

      res.status(201).json(incident);
    } catch (error) {
      res.status(400).json({
        message: "Error creating incident",
        error: (error as Error).message,
      });
    }
  }

  async resolveIncident(req: any, res: any): Promise<void> {
    try {
      // Nota: Si usas Express, suele ser req.params.incidentId
      // Si usas tu HttpServer manual, asegúrate de que el ID venga correctamente
      const { incidentId } = req.params;
      
      await this.resolveIncidentUseCase.execute(incidentId);
      res.status(200).json({ message: "Incident resolved successfully" });
    } catch (error) {
      res.status(400).json({
        message: "Error resolving incident",
        error: (error as Error).message,
      });
    }
  }
}

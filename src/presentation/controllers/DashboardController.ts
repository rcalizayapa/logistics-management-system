import { GetOperationalDashboardUseCase } from "../../application/use-cases/GetOperationalDashboardUseCase.js";
export class DashboardController {
  constructor(
    private readonly getOperationalDashboardUseCase: GetOperationalDashboardUseCase
  ) {}

  async getDashboard(req: any, res: any): Promise<void> {
    try {
      const dashboard = await this.getOperationalDashboardUseCase.execute();
      res.status(200).json(dashboard);
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving operational dashboard",
        error: (error as Error).message,
      });
    }
  }
}
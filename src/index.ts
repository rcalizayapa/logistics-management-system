//console.log("Logistics Management System Started");
import { CreateOrderUseCase } from "./application/use-cases/CreateOrderUseCase";
import { CreateDriverUseCase } from "./application/use-cases/CreateDriverUseCase";
import { DeliveryType } from "./domain/enums/DeliveryType";
import { GreedyAssignmentStrategy } from "./application/strategies/GreedyAssignmentStrategy";
import { OrderAssignmentService } from "./application/services/OrderAssignmentService";

console.log("System Booting...");

const createOrder = new CreateOrderUseCase();
const createDriver = new CreateDriverUseCase();

const driver1 = createDriver.execute("D1", "Carlos", -12.04, -77.03, "Lima Centro");
const driver2 = createDriver.execute("D2", "Luis", -12.05, -77.02, "Miraflores");

const order = createOrder.execute(
  "O1",
  -12.06,
  -77.04,
  "San Isidro",
  DeliveryType.EXPRESS,
  new Date(),
  new Date(Date.now() + 2 * 60 * 60 * 1000)
);

const strategy = new GreedyAssignmentStrategy();
const assignmentService = new OrderAssignmentService(strategy);

assignmentService.assignOrder(order, [driver1, driver2]);

console.log("Order assigned successfully.");

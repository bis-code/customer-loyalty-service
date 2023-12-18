import App from './app';
import config from "config";

import CustomerController from './customer/customer.controller';
import EventController from "./event/event.controller";
import CustomerService from "./customer/customer.service";
import EventService from "./event/event.service";
import LoyaltyPointsService from "./loyaltypoint/loyaltyPointsService";
import OrderService from "./order/order.service";

const port = config.get("port") as number;
const host = config.get("host") as string;

// services
let customerService = new CustomerService();
let loyaltyPointsService = new LoyaltyPointsService();
let orderService = new OrderService(loyaltyPointsService, customerService);
let eventService = new EventService(orderService, customerService);

const app = new App(
    [
        new EventController(eventService),
        new CustomerController(customerService, loyaltyPointsService)
    ],
    host, port
);

app.listen();
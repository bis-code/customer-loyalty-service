import {Customer, EventLog, Order} from '@prisma/client';
import log from '../common/logger';

import LoyalPointsService from "../loyaltypoint/loyaltyPointsService";
import CustomerService from "../customer/customer.service";
import prisma from "../../libs/prismaClient";

class OrderService {
    public loyaltyPointsService: LoyalPointsService;
    public customerService: CustomerService;

    constructor(loyaltyPointsServices: LoyalPointsService,
                customerService: CustomerService) {
        this.loyaltyPointsService = loyaltyPointsServices;
        this.customerService = customerService;
    }

    findById = async (id: string): Promise<Order | null> => {
        log.info("Fetching by id from order service");
        const order: Order | null = await prisma.order.findFirst({
            where: {
                id: id,
            }
        });

        log.info("Found order in service");
        return order;
    }

    orderPlaced = async (event: EventLog): Promise<Boolean> => {
        const payload = JSON.parse(event.payload);
        if (payload.OrderId === null || payload.CustomerId === null) return false;
        const customer: Customer | null = await this.customerService.findById(payload.CustomerId);
        if (customer === null) return false;

        await prisma.order.upsert({
            where: {
                id: payload.OrderId,
            },
            update: {
                customerId: payload.CustomerId,
                totalOrderAmount: payload.TotalOrderAmount,
            },
            create: {
                id: payload.OrderId,
                customerId: payload.CustomerId,
                totalOrderAmount: payload.TotalOrderAmount,
            },
        }).then((result) => {
            log.debug(result, `${event.eventName} -> Event ${event.id} has been updated during upsert operation`);
        });
        const pointsEarned = Math.floor(payload.TotalOrderAmount / 50);
        await this.loyaltyPointsService.addLoyaltyPoints(payload.CustomerId, pointsEarned, payload.OrderId);
        return true;
    }

    orderCanceled = async (event: EventLog): Promise<Boolean> => {
        const payload = JSON.parse(event.payload);
        const orderId: string = payload.OrderId;


        if (orderId === null) return false;

        const order: Order | null = await this.findById(orderId);
        if (order === null) return false;

        await prisma.order.update({
            where: {id: orderId},
            data: {
                deletedAt: new Date(),
                loyaltyPoints: {
                    updateMany: {
                        where: {},
                        data: {deletedAt: new Date()},
                    },
                },
            },
        }).then((result) => {
            log.debug(result, `${event.eventName} -> Event ${event.id} has been updated during update operation`);
        });
        return true;
    }

    orderReturned = async (event: EventLog) => {
        const payload = JSON.parse(event.payload);
        const orderId: string = payload.OrderId;

        if (orderId === null) return false;

        const order: Order | null = await this.findById(orderId);
        if (order === null) return false;

        await prisma.order.update({
            where: {id: orderId},
            data: {
                returnedAt: new Date(),
                loyaltyPoints: {
                    updateMany: {
                        where: {},
                        data: {deletedAt: new Date()},
                    },
                },
            },
        }).then((result) => {
            log.debug(result, `${event.eventName} -> Event ${event.id} has been updated during update operation`);
        });
        return true;
    }

}

export default OrderService;
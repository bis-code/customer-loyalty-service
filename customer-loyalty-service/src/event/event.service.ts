import {EventLog, Prisma} from '@prisma/client';
import log from '../common/logger';
import EventLogDTO from "../dto/eventlog.dto";
import CustomerService from "../customer/customer.service";
import OrderService from "../order/order.service";
import EventName from "../enums/EventName";
import prisma from "../../libs/prismaClient";

class EventService {

    public orderService: OrderService;
    public customerService: CustomerService;

    constructor(orderService: OrderService,
                customerService: CustomerService) {
        this.customerService = customerService;
        this.orderService = orderService;
    }

    addEvent = async (input: EventLogDTO) => {
        return prisma.eventLog.create({
            data: {
                eventTime: new Date(input.EventTime),
                eventName: input.EventName,
                entityName: input.EntityName,
                sequence: input.Sequence,
                payload: JSON.stringify(input.Payload),
            } as EventLog,
        });
    }

    processEvents = async (lockTimeout: number) => {
        const LOCK_TIMEOUT = lockTimeout * 60 * 1000;
        const now = new Date();
        const lockThreshold = new Date(now.getTime() - LOCK_TIMEOUT);

        const events = await this.getUnlockedEvents(lockThreshold);

        for (const event of events) {
            try {
                log.info("Attempting to lock the event", event.id);
                const updatedEvent = await this.attemptToLockEvent(event, lockThreshold, now);

                if (updatedEvent.count === 0) {
                    log.info(`Event with ID ${event.id} has been already locked by another processor`)
                    continue;
                }

                const eventProcessed = await this.processEvent(event);
                if (eventProcessed) {
                    log.info(`Event with ID ${event.id} has been processed successfully`)
                    await prisma.eventLog.update({
                        where: {id: event.id},
                        data: {processed: true, lockedAt: null},
                    });
                } else {
                    log.info(`Event with ID ${event.id} could not be processed`);
                    await this.unlockEvent(event);
                }
            } catch (error) {
                log.error(`Error processing event ${event.id}:`, error);
                await this.unlockEvent(event);
            }
        }
    }

    private processEvent = async (event: EventLog): Promise<Boolean> => {
        log.info(`Processing event: ${event.eventName}, Sequence: ${event.sequence}`);
        switch (event.eventName) {
            case EventName.CUSTOMER_CREATED:
                return await this.customerService.createCustomer(event);
                break;
            case EventName.CUSTOMER_DELETED:
                return await this.customerService.deleteCustomerById(event);
                break;
            case EventName.ORDER_PLACED:
                return await this.orderService.orderPlaced(event);
                break;
            case EventName.ORDER_CANCELED:
                return await this.orderService.orderCanceled(event);
                break;
            case EventName.ORDER_RETURNED:
                return await this.orderService.orderReturned(event);
                break;
            default:
                return Promise.resolve(false);
        }
    }

    private attemptToLockEvent = async (event: EventLog, lockThreshold: Date, now: Date): Promise<Prisma.BatchPayload> => {
        return prisma.eventLog.updateMany({
            where: {
                id: event.id,
                OR: [
                    {lockedAt: null},
                    {lockedAt: {lt: lockThreshold}},
                ],
            },
            data: {lockedAt: now},
        });
    }

    private getUnlockedEvents = async (lockThreshold: Date) => {
        return prisma.eventLog.findMany({
            where: {
                processed: false,
                OR: [
                    // either check if there is no locker put on the event
                    {lockedAt: null},
                    // if the current locker date is less than lock threshold
                    {lockedAt: {lt: lockThreshold}},
                ],
            },
            orderBy: [
                {eventTime: 'asc'},
                {sequence: 'asc'},
            ],
        });
    }

    private unlockEvent = async (event: EventLog): Promise<void> => {
        await prisma.eventLog.update({
            where: {id: event.id},
            data: {lockedAt: null},
        });
    }
}

export default EventService;
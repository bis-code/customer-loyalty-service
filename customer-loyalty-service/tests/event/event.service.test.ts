import EventName from "../../src/enums/EventName";
import EntityName from "../../src/enums/EntityName";
import EventService from "../../src/event/event.service";
import CustomerService from "../../src/customer/customer.service";
import OrderService from "../../src/order/order.service";
import LoyaltyPointsService from "../../src/loyaltypoint/loyaltyPointsService";
import {EventLog} from "@prisma/client";
import EventLogDTO from "../../src/dto/eventlog.dto";
import PayLoadDTO from "../../src/dto/payload.dto";
import {expect, test, afterAll} from 'vitest';
import prisma from "../../libs/__mocks__/prismaClient";

let customerService: CustomerService = new CustomerService();
let loyaltyPointsService: LoyaltyPointsService = new LoyaltyPointsService();
let orderService: OrderService = new OrderService(loyaltyPointsService, customerService);
let eventService: EventService = new EventService(orderService, customerService);

const orderId = 'random-uuid-order';

afterAll(() => {
    const payload = JSON.stringify({
        OrderId: orderId
    });

    prisma.eventLog.deleteMany({
        where: {
            payload: payload,
        }
    });
})

test('should add event and have default values created', async () => {
    let nowDate: Date = new Date();

    const newEvent = {
        eventTime: nowDate,
        eventName: EventName.ORDER_RETURNED,
        entityName: EntityName.ORDER,
        sequence: 2,
        payload: JSON.stringify({
            OrderId: orderId
        })
    } as EventLog;

    prisma.eventLog.create.mockResolvedValue(newEvent);

    const eventLog = await eventService.addEvent(convertToEventLogDTO(newEvent))

    expect(eventLog.eventTime).toStrictEqual(newEvent.eventTime);
    expect(eventLog.eventName).toStrictEqual(newEvent.eventName);
    expect(eventLog.entityName).toStrictEqual(newEvent.entityName);
    expect(eventLog.payload).toStrictEqual(newEvent.payload);
    // default values
    expect(eventLog).toHaveProperty('createdAt');
    expect(eventLog.createdAt).toBeInstanceOf(Date);
    expect(eventLog).toHaveProperty('id');
    expect(typeof eventLog.id).toBe('string');
    expect(eventLog).toHaveProperty('lockedAt', null);
    expect(eventLog).toHaveProperty('processed', false);
})

const convertToEventLogDTO = (event: EventLog) => {
    const payloadDTO: PayLoadDTO = JSON.parse(event.payload);
    return {
        EventTime: event.eventTime,
        EventName: convertToEventName(event.eventName),
        EntityName: convertToEntityName(event.entityName),
        Sequence: event.sequence,
        Payload: payloadDTO,
    } satisfies EventLogDTO;
}

const convertToEventName = (eventName: string): EventName => {
    switch (eventName) {
        case EventName.ORDER_RETURNED: {
            return EventName.ORDER_RETURNED;
        }
        case EventName.ORDER_CANCELED: {
            return EventName.ORDER_CANCELED;
        }
        case EventName.ORDER_PLACED: {
            return EventName.ORDER_PLACED;
        }
        case EventName.CUSTOMER_DELETED: {
            return EventName.CUSTOMER_DELETED;
        }
        case EventName.CUSTOMER_CREATED: {
            return EventName.CUSTOMER_CREATED;
        }
        default: {
            return EventName.UNKNOWN;
        }
    }
}

const convertToEntityName = (entityName: string): EntityName => {
    switch (entityName) {
        case EntityName.ORDER: {
            return EntityName.ORDER;
        }
        case EntityName.CUSTOMER: {
            return EntityName.CUSTOMER;
        }
        default: {
            return EntityName.UNKNOWN;
        }
    }
}
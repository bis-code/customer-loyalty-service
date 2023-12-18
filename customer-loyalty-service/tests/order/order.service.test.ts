import {test, beforeEach, expect, afterAll, vi} from 'vitest';
import OrderService from '../../src/order/order.service';
import CustomerService from '../../src/customer/customer.service';
import LoyaltyPointsService from '../../src/loyaltypoint/loyaltyPointsService';
import prisma from '../../libs/__mocks__/prismaClient';
import {EventLog, Order} from "@prisma/client";
import EventName from "../../src/enums/EventName";
import EntityName from "../../src/enums/EntityName";

vi.mock('../../src/customer/customer.service');
vi.mock('../../src/loyaltypoint/loyaltyPointsService');

const customerService = new CustomerService();
const loyaltyPointsService = new LoyaltyPointsService();
const orderService = new OrderService(loyaltyPointsService, customerService);

const orderId = 'a-mocked-order-id';
const customerId = 'a-mocked-custmoer-id';

beforeEach(() => {
    vi.clearAllMocks();
})

afterAll(() => {
    prisma.order.deleteMany({
        where: {
            OR: [
                {id: orderId},
                {customerId: customerId}
            ]
        }
    });
})

test('should not find an order by ID', async () => {
    const mockOrder = {
        id: orderId,
        totalOrderAmount: 18270,
        customerId: customerId,
        createdAt: new Date(),
        deletedAt: null,
        returnedAt: null
    } as Order;
    prisma.order.findFirst.mockResolvedValue(mockOrder);

    const result: Order | null = await orderService.findById('anotherOrderId');

    expect(result).is.null;
});

test('should not place order if customer is not found', async () => {
    vi.mock('../../src/customer/customer.service', () => {
        return {
            default: vi.fn().mockImplementation(() => ({
                findById: vi.fn().mockResolvedValue(null),
            })),
        };
    });
    const newEvent = {
        eventTime: new Date(),
        eventName: EventName.ORDER_PLACED,
        entityName: EntityName.ORDER,
        sequence: 2,
        payload: JSON.stringify({
            OrderId: orderId,
            CustomerId: customerId,
            TotalOrderAmount: 12312,
        })
    } as EventLog;

    const result = await orderService.orderPlaced(newEvent);

    expect(result).is.false;
})

test('should not place order if customerId is null', async () => {
    const newEvent = {
        eventTime: new Date(),
        eventName: EventName.ORDER_PLACED,
        entityName: EntityName.ORDER,
        sequence: 2,
        payload: JSON.stringify({
            CustomerId: null,
            OrderId: orderId,
            TotalOrderAmount: 12312,
        })
    } as EventLog;

    const result = await orderService.orderPlaced(newEvent);

    expect(result).is.false;
})

test('should not place order if orderId is null', async () => {
    const newEvent = {
        eventTime: new Date(),
        eventName: EventName.ORDER_PLACED,
        entityName: EntityName.ORDER,
        sequence: 2,
        payload: JSON.stringify({
            CustomerId: customerId,
            OrderId: null,
            TotalOrderAmount: 12312,
        })
    } as EventLog;

    const result = await orderService.orderPlaced(newEvent);

    expect(result).is.false;
})

function assertOrders(expectedOrder: Order, returnedOrder: Order) {
    expect(expectedOrder.customerId).toStrictEqual(returnedOrder.customerId);
    expect(expectedOrder.returnedAt).toStrictEqual(returnedOrder.returnedAt);
    expect(expectedOrder.totalOrderAmount).toStrictEqual(returnedOrder.totalOrderAmount);
    expect(expectedOrder.id).toStrictEqual(returnedOrder.id);
    expect(expectedOrder.deletedAt).toStrictEqual(returnedOrder.deletedAt);
    expect(returnedOrder).toHaveProperty('createdAt');
}
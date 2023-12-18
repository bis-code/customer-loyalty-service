import {Customer, EventLog} from '@prisma/client';
import log from '../common/logger';
import prisma from "../../libs/prismaClient";

class CustomerService {
    createCustomer = async (event: EventLog): Promise<Boolean> => {
        const payload = JSON.parse(event.payload);
        if (payload.CustomerId === null) return false;

        await prisma.customer.upsert({
            where: {
                id: payload.CustomerId,
            },
            update: {
                deletedAt: null,
            },
            create: {
                id: payload.CustomerId,
            }
        });

        return true;
    }

    findById = async (id: string): Promise<Customer | null> => {
        log.info("Fetching by id from customer service");
        const customer: Customer | null = await prisma.customer.findFirst({
            where: {
                id: id,
            }
        });
        if (customer !== null) {
            log.info(`Customer with ID ${customer.id} found`);
            return customer;
        }
        log.info(`Customer with ID ${id} not found`)
        return null;
    }

    deleteCustomerById = async (event: EventLog): Promise<Boolean> => {
        const payload = JSON.parse(event.payload);
        if (payload.CustomerId === null) {
            return false;
        }
        const customer: Customer | null = await this.findById(payload.CustomerId);
        if (customer === null) return false;

        await prisma.customer.update({
            where: {
                id: payload.CustomerId,
            },
            data: {deletedAt: new Date()}
        });
        return true;
    }

}

export default CustomerService;
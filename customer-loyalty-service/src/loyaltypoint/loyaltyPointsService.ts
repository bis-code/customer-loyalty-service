import prisma from "../../libs/prismaClient";
import log from "../common/logger";
import {LoyaltyPoint} from "@prisma/client";

class LoyaltyPointsService {
    constructor() {
    }

    getTotalLoyaltyPoints = async (customerId: string): Promise<number | null> => {
        try {
            const today = new Date();

            const customer = await prisma.customer.findUnique({
                where: {id: customerId}
            });

            if (!customer) {
                return null;
            }

            const loyaltyPoints = await prisma.loyaltyPoint.findMany({
                where: {
                    customerId: customerId,
                    expiresAt: {
                        gt: today
                    },
                    consumed: false,
                    deletedAt: null
                }
            });

            return loyaltyPoints.reduce((sum, record) => sum + (record.points - record.spent), 0);
        } catch (error) {
            log.error(error, 'Error in getTotalLoyaltyPoints:');
            throw error;
        }
    }

    consumeLoyaltyPoints = async (customerId: string, pointsToConsume: number): Promise<number | null> => {
        try {
            const currentPoints: number | null = await this.getTotalLoyaltyPoints(customerId);

            if (currentPoints === null || pointsToConsume > currentPoints) {
                return null;
            }

            const todayDate: Date = new Date();

            const availablePoints: LoyaltyPoint[] = await prisma.loyaltyPoint.findMany({
                where: {
                    customerId: customerId,
                    expiresAt: {gt: todayDate},
                    consumed: false,
                    deletedAt: null
                },
                orderBy: {createdAt: 'asc'}
            });

            let pointsRemainingToConsume = pointsToConsume;

            for (const pointRecord of availablePoints) {
                if (pointsRemainingToConsume <= 0) break;
                pointsRemainingToConsume = await this.usePointRecord(pointRecord, pointsRemainingToConsume, todayDate);
            }

            return await this.getTotalLoyaltyPoints(customerId);
        } catch (error) {
            console.error('Error in consumeLoyaltyPoints:', error);
            throw error;
        }
    }

    addLoyaltyPoints = async (customerId: string, points: number, orderId: string): Promise<void> => {
        const currentDate = new Date();
        const expirationDate = new Date(currentDate.setMonth(currentDate.getMonth() + 6));

        if (points > 0) {
            await prisma.loyaltyPoint.create({
                data: {
                    customerId: customerId,
                    points: points,
                    spent: 0,
                    consumed: false,
                    orderId: orderId,
                    expiresAt: expirationDate,
                },
            });
        }
    }

    private usePointRecord = async (pointRecord: LoyaltyPoint, pointsRemainingToConsume: number, today: Date): Promise<number> => {
        const availablePointsInRow = pointRecord.points - pointRecord.spent;
        let pointsToDeduct = Math.min(availablePointsInRow, pointsRemainingToConsume);
        pointsRemainingToConsume -= pointsToDeduct;

        await prisma.loyaltyPoint.update({
            where: {id: pointRecord.id},
            data: {
                spent: pointRecord.spent + pointsToDeduct,
                consumed: (pointRecord.spent + pointsToDeduct) === pointRecord.points,
                deletedAt: (pointRecord.spent + pointsToDeduct) === pointRecord.points ? today : null
            }
        });

        return pointsRemainingToConsume;
    }
}

export default LoyaltyPointsService;
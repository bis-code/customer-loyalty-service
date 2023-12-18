import * as express from 'express';
import CustomerService from './customer.service';
import IController from '../interface/controller.interface';
import log from '../common/logger';
import LoyaltyPointsService from "../loyaltypoint/loyaltyPointsService";

class CustomerController implements IController {

    public path = "/customer";
    public router = express.Router();
    public customerService: CustomerService;
    public loyaltyPointsService: LoyaltyPointsService;

    constructor(customerService: CustomerService,
                loyaltyPointsService: LoyaltyPointsService) {
        this.initializeRoutes();
        this.customerService = customerService;
        this.loyaltyPointsService = loyaltyPointsService;
    }

    public initializeRoutes() {
        this.router.get(`${this.path}/:customerId/points`, this.getCustomerPoints);
        this.router.post(`${this.path}/:customerId/consume`, this.consumePoints);
    }

    getCustomerPoints = async (req: express.Request, res: express.Response) => {
        try {
            const customerId = req.params.customerId;
            const totalPoints = await this.loyaltyPointsService.getTotalLoyaltyPoints(customerId);

            if (totalPoints !== null) {
                return res.json({points: totalPoints});
            } else {
                return res.status(400).json({error: 'Insufficient loyalty points'});
            }
        } catch (error) {
            log.error(error);
            return res.status(500).json({error: 'Internal Server Error'});
        }
    }

    consumePoints = async (req: express.Request, res: express.Response) => {
        try {
            const customerId = req.params.customerId;
            const points = Number(req.body.points);

            if (points <= 0) {
                return res.status(403).json({error: 'loyalty points are less or equal then 0'});
            }

            const totalPoints = await this.loyaltyPointsService.consumeLoyaltyPoints(customerId, points);
            if (totalPoints !== null) {
                return res.json({points: totalPoints});
            } else {
                return res.status(404).json({error: 'Insufficient loyalty points'});
            }
        } catch (error) {
            log.error(error);
            return res.status(500).json({error: 'Internal Server Error'});
        }
    }

}

export default CustomerController;
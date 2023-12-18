import * as express from 'express';
import IController from '../interface/controller.interface';
import EventService from "./event.service";
import EventLogDTO from "../dto/eventlog.dto";
import EventName from "../enums/EventName";
import EntityName from "../enums/EntityName";

class EventController implements IController {

    public path = "/webhook";
    public router = express.Router();
    public eventService: EventService;


    constructor(eventService: EventService) {
        this.eventService = eventService;

        this.initializeRoutes();
        this.processEvents();
    }

    public initializeRoutes() {
        this.router.post(`${this.path}`, this.handleEvents);
    }

    public processEvents() {
        setInterval(async () => {
            await this.eventService.processEvents(10);
        }, 5000);
    }

    handleEvents = async (req: express.Request, res: express.Response) => {
        try {
            if (req.body.EventName in EventName) return res.status(404).json({message: `Event with eventName: ${req.body.EventName}, could not be found.`});
            if (req.body.EntityName in EntityName) return res.status(404).json({message: `Event with entityName: ${req.body.EntityName}, could not be found.`});

            const eventLog: EventLogDTO = req.body;
            await this.eventService.addEvent(eventLog);


            res.status(201).json({message: 'Event received and stored for processing.'});
        } catch (error) {
            console.error('Error receiving webhook:', error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    }
}

export default EventController;
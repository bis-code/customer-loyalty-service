import PayLoadDTO from "./payload.dto";
import EventName from "../enums/EventName";
import EntityName from "../enums/EntityName";

interface EventLogDTO {
    EventTime: Date,
    EventName: EventName,
    EntityName: EntityName,
    Sequence: number,
    Payload: PayLoadDTO,
}

export default EventLogDTO;
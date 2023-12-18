import Pino from 'pino'
import dayjs from 'dayjs';

const log = Pino ({
    name: "CLS",
    level: "debug",

    base: {
        pid: false,
    },
    timestamp: () => `,"time":"${dayjs().format()}"`
});

export default log;
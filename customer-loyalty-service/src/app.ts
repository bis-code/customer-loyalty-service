import express from 'express';
import log from './common/logger';

import IController from './interface/controller.interface';

class App {

    public app: express.Application;
    public port: number;
    public host: string;

    constructor(controllers: Array<IController>, host: string, port: number){
        this.app = express();
        this.port = port;
        this.host = host;

        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }

    private initializeMiddlewares(){
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}))
    }

    private initializeControllers(controllers: Array<IController>){
        controllers.forEach((controller) => {
            if(controller.router){
                this.app.use('/', controller.router);
            }
        });
    }

    public listen(){
        this.app.listen(this.port, this.host, () => {
            log.info(`Server
             listening at http://${this.host}:${this.port}`);
        });
    }
}

export default App;
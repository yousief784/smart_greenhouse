import express, { Application, NextFunction, Request, Response } from 'express';
import config from './config';
import database from './database';
import router from './routes/index.routes';
import localStrategy from './apis/passport/localStrategy';
import session from 'express-session'; // session middleware
import bodyParser from 'body-parser';
import jwtStr from './apis/passport/passport-jwt';
import CheckFoldersExists from './utils/createFolders';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import http from 'http';
import { Server } from 'socket.io';
import errorHandler from './middlewares/errorHandler.middleware';
import dns from 'dns';

const app: Application = express();
const server = http.createServer(app);
const port: number = parseInt(config.port as string) || 5000;
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});
// check if all folderAreExists
const checkFoldersExists = new CheckFoldersExists();
checkFoldersExists.foldersAreExists();

app.use(cors());

// for Security
app.use(helmet());

// request.body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// session for authentication
app.use(
    session({
        secret: config.sessionSecret as string,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
    })
);

// Configure Middleware
app.use(localStrategy);
jwtStr.jwtStrategyMiddleware();

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [new winston.transports.File({ filename: 'error.log' })],
});

app.post('/ultrasonic', (req: Request, res: Response) => {
    const data = req.body;
    console.log('ultra: ', data);
    io.emit('distance', data);
    res.sendStatus(200);
});

app.post('/ldr', (req: Request, res: Response) => {
    const data = req.body;
    console.log('ldr: ', data);
    io.emit('lighting', data);
    res.sendStatus(200);
});

app.post('/dht', (req: Request, res: Response) => {
    const data = req.body;
    console.log('dht: ', data);
    io.emit('fan', data);
    res.sendStatus(200);
});

app.post('/pump', (req: Request, res: Response) => {
    const data = req.body;
    console.log('pump: ', data);
    io.emit('pump', data);
    res.sendStatus(200);
});

app.get('/', (req: Request, res: Response): void => {
    res.status(200).json({
        status: 200,
        message: 'Welcome in  our Application!',
    });
});

app.use('/api', router);
// Add the validation error handling middleware to your app
app.use(errorHandler);

server.listen(port, config.serverIP, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`);
    database.connect();
});

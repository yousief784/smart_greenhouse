import { Router, Request, Response } from 'express';
import axios from 'axios';
import config from '../../../config';
import authMiddleware from '../../../middlewares/auth.middleware';
import adminMiddleware from '../../../middlewares/admin.middleware';

const gargeRouter: Router = Router();

gargeRouter.post(
    '/turn-on-garage-servo',
    authMiddleware,
    adminMiddleware,
    async (req: Request, res: Response) => {
        try {
            const garageReads = await axios.get(
                `${config.hardwareNetwork}/turn-on-garage-servo`
            );

            console.log('garage on: ', garageReads);

            res.status(garageReads.data.status).json({
                status: garageReads.data.status,
                garageStatus: garageReads.data.garage_servo,
                message: garageReads.data.message,
            });
        } catch (error) {
            res.status(500).json({ status: 500, error });
        }
    }
);

gargeRouter.post(
    '/turn-off-garage-servo',
    authMiddleware,
    adminMiddleware,
    async (req: Request, res: Response) => {
        try {
            const garageReads = await axios.get(
                `${config.hardwareNetwork}/turn-off-garage-servo`
            );

            return res.status(garageReads.data.status).json({
                status: garageReads.data.status,
                garageStatus: garageReads.data.garage_servo,
                message: garageReads.data.message,
            });
        } catch (error) {
            res.status(500).json({ status: 500, error });
        }
    }
);

export default gargeRouter;

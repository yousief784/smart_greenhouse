import axios from 'axios';
import { Router, Request, Response } from 'express';
import config from '../../../config';

const gateServoRouter: Router = Router();

gateServoRouter.get(
    '/turn-on-gate-servo',
    async (req: Request, res: Response) => {
        try {
            const gateReads = await axios.get(
                `${config.hardwareNetwork}/turn-on-gate-servo`
            );

            return res.status(gateReads.data.status).json({
                status: gateReads.data.status,
                gateStatus: gateReads.data.gate_servo,
                message: gateReads.data.message,
            });
        } catch (error) {
            console.log('error', error);
        }
    }
);

gateServoRouter.get(
    '/turn-off-gate-servo',
    async (req: Request, res: Response) => {
        try {
            const gateReads = await axios.get(
                `${config.hardwareNetwork}/turn-off-gate-servo`
            );

            return res.status(gateReads.data.status).json({
                status: gateReads.data.status,
                gateStatus: gateReads.data.gate_servo,
                message: gateReads.data.message,
            });
        } catch (error) {
            console.log(error);
        }
    }
);

export default gateServoRouter;

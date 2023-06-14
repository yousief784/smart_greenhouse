import { Router, Request, Response } from 'express';
import axios from 'axios';
import config from '../../../config';

const dhtRouter: Router = Router();

dhtRouter.get('/humidity', async (req: Request, res: Response) => {
    try {
        const response = await axios.get(`${config.hardwareNetwork}/dht`);

        if (response.data.status !== 200) return;

        res.status(200).json({
            status: 200,
            data: response.data.humidity,
            message: 'OK',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            message: error,
        });
    }
});

dhtRouter.get('/', async (req: Request, res: Response) => {
    try {
        const { temp } = req.query;

        let response;
        if (temp != undefined) {
            response = await axios.get(
                `${config.hardwareNetwork}/dht?temp=${temp}`
            );
        } else {
            response = await axios.get(`${config.hardwareNetwork}/dht`);
        }

        res.status(response.data.status).json({
            status: response.data.status,
            message: response.data.message,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error,
        });
    }
});

export default dhtRouter;

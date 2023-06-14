import { Router, Request, Response } from 'express';

const adminDashboardRouter: Router = Router();

adminDashboardRouter.get('/h', (req: Request, res: Response) => {
    res.json({ message: 'OK admin' });
});

export default adminDashboardRouter;

import { Router } from 'express';
import adminDashboardRouter from './adminDashboard.routes';
import adminDashboardActionsRouter from './adminDashboardActions.routes';

const adminRouter: Router = Router();

adminRouter.use('/', adminDashboardRouter);
adminRouter.use('/action', adminDashboardActionsRouter);

export default adminRouter;

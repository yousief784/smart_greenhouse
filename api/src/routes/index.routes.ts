import { Router } from 'express';
import adminMiddleware from '../middlewares/admin.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import adminDashboardRouter from './api/admin/adminDashboard.routes';
import dhtRouter from './api/sensors/dht.routes';
import gargeRouter from './api/sensors/garage.routes';
import gateServoRouter from './api/sensors/gateServo.routes';
import userRouter from './api/userRoute/index.routes';

const router: Router = Router();

router.use('/users', userRouter);
router.use('/admin', authMiddleware, adminMiddleware, adminDashboardRouter);
router.use('/garage', gargeRouter);
router.use('/dht', dhtRouter);
router.use('/gate', gateServoRouter);

export default router;

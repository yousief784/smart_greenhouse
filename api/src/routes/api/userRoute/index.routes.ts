import { Router } from 'express';
import authRouter from './auth.routes';

const userRouter: Router = Router();

userRouter.use('/auth', authRouter);

export default userRouter;

import { Router, Request, Response } from 'express';
import passport from 'passport';
import AuthController from '../../../Controller/UserController/authUser';
import authMiddleware from '../../../middlewares/auth.middleware';
import adminMiddleware from '../../../middlewares/admin.middleware';

const authRouter: Router = Router();
const authController = new AuthController();

authRouter.get('/show', authMiddleware, authController.show);

authRouter.post(
    '/signup',
    authMiddleware,
    adminMiddleware,
    authController.create
);

authRouter.get('/failure', (req: Request, res: Response) => {
    try {
        res.status(400).json({
            status: 400,
            message: 'Invalide password or email',
        });
    } catch (error) {}
});

authRouter.post(
    '/login',
    passport.authenticate('local', {
        failureRedirect: '/api/users/auth/failure',
    }),
    authController.login
);

authRouter.post('/email-verification', authController.emailVerified);

authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/password-reset', authController.resetPassword);

authRouter.post('/update', authMiddleware, authController.update);
authRouter.post('/logout', authMiddleware, authController.logout);

export default authRouter;

import { Request, Response, NextFunction } from 'express';
import User from '../schema/userSchema';

const emailVerificationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userAuthenticated = req.user && Object.assign(req.user)._id;
    const user = await User.findOne({
        user: userAuthenticated,
        emailVerifiedAt: { $ne: null },
    }).count();

    user
        ? next()
        : res
              .status(403)
              .json({ status: 403, message: 'Does not have admin permission' });
};

export default emailVerificationMiddleware;

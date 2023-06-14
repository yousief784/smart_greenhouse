import { Request, Response, NextFunction } from 'express';
import Admin from '../schema/adminSchema';
import User from '../schema/userSchema';

const adminMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.header('authorization');
    let isAdmin;
    if (authHeader) {
        const authToken = authHeader.split(' ')[1];
        const user = await User.findOne({ authToken: authToken });

        if (user) {
            isAdmin = await Admin.findOne({ user: user._id });
        }

        if (isAdmin) {
            next();
            return;
        }

        return res
            .status(403)
            .json({ status: 403, message: 'You dont have a permission' });
    }
};

export default adminMiddleware;

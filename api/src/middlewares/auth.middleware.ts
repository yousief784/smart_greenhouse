import { Request, Response, NextFunction } from 'express';
import User from '../schema/userSchema';

const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.header('authorization');    
    if (authHeader) {
        const authToken = authHeader.split(' ')[1];
        const user = await User.findOne({ authToken: authToken });

        if (user) {
            next();
            return;
        }

        return res
            .status(401)
            .json({ status: 401, message: 'You are Unauthorized' });
    }

    return res
        .status(401)
        .json({ status: 401, message: 'You are Unauthorized' });
};

export default authMiddleware;

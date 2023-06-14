import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { logger } from '../app';

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof MongooseError.ValidationError) {
        // Log the validation error using your Winston logger
        logger.error('A validation error occurred', { error: err });
        if (err.name === 'ValidationError') {
            let errors: any = {};

            Object.keys(err.errors).forEach((key) => {
                errors[key] = err.errors[key].message;
            });

            return res.status(400).send(errors);
        }
        res.status(500).send('Something went wrong');
    } else {
        next(err);
    }
};

export default errorHandler;

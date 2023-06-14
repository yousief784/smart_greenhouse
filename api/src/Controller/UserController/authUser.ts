import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import config from '../../config';
import User from '../../schema/userSchema';
import Admin from '../../schema/adminSchema';
import { USER_ROLE } from '../../interfaces/user.interface';
import { logger } from '../../app';
import handlebars from 'handlebars';

class AuthController {
    show = async (req: Request, res: Response, next: NextFunction): Promise<void | object> => {
        try {
            let role: string = USER_ROLE.WORKER;
            const token = req.header('authorization')?.split(' ')[1];
            const user = await User.findOne({ authToken: token }).select([
                'fullName',
                'email',
            ]);

            !user &&
                res.status(404).json({
                    status: 404,
                    message: 'User not found',
                });

            const isAdmin = await Admin.findOne({
                user: user?._id,
            }).count();

            if (isAdmin) {
                role = USER_ROLE.ADMIN;
            }

            res.status(200).json({
                status: 200,
                data: user,
                role,
                message: 'success',
            });
        } catch (error) {
            logger.error('An error occurred', { error: error });
            return next(error);
        }
    };

    create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | object> => {
        try {
            const { fullName, email, password } = req.body;
            if (!(fullName && email && password)) {
                return res.status(400).json({
                    status: 400,
                    message: 'Bad Request send fullName, email and password',
                });
            }
            const isUserExist = await User.findOne({
                email: email,
            }).count();

            if (isUserExist)
                return res.status(400).json({
                    status: 400,
                    message: 'User Already Exists',
                });

            const createUser = await User.register(req.body, req.body.password);

            if (!createUser)
                return res
                    .status(400)
                    .json({ status: 400, message: 'User Not Created' });

            const minNumberGenerated = 100000;
            const maxNumberGenerated = 1000000;
            const generateCode = Math.floor(
                Math.random() * (maxNumberGenerated - minNumberGenerated) +
                    minNumberGenerated
            ).toString();
            const updateToken = await User.findOneAndUpdate(
                { email: email },
                {
                    emailVerificationCode: generateCode,
                },
                { new: true }
            );
            const user = JSON.parse(JSON.stringify(updateToken));

            this.sendVerificationEmail(email, generateCode, next);

            return res.status(200).json({
                status: 200,
                message: 'Email verification sent to your email',
            });
        } catch (error: any) {
            logger.error('An error occurred', { error: error });
            return next(error);
        }
    };

    emailVerified = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, code } = req.body;
            const updateEmailVerfication = await User.findOneAndUpdate(
                { email: email, emailVerificationCode: code },
                { emailVerifiedAt: Date.now() },
                { new: true, runValidators: true }
            ).then((data: any) => {
                data.emailVerificationCode = null;
                data.save();
                return data;
            });

            if (!updateEmailVerfication) {
                return res
                    .status(400)
                    .json({ status: 400, message: 'Email Not Verified' });
            }

            res.status(200).json({
                status: 200,
                message: 'Email Verified Successfully',
            });
        } catch (error) {
            logger.error('Email Verification code is not valid', error);
            return next(error);
        }
    };

    async update(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | object> {
        try {
            let passwordChangedHasError = false;
            let message: string = '';
            const { fullName, password } = req.body;
            if (!(fullName || password))
                return res.status(400).json({
                    status: 400,
                    message: 'Bad Request send fullName or password',
                });
            const authToken = req.header('authorization')?.split(' ')[1];

            const updatedUser = await User.findOneAndUpdate(
                { authToken: authToken },
                {
                    fullName,
                },
                {
                    runValidators: true,
                    new: true,
                }
            ).then((data: any) => {
                if (password != undefined) {
                    data.setPassword(password, (error: any, data: any) => {
                        if (error) {
                            logger.error('password not updated', error);
                            return next(error);
                        }
                        passwordChangedHasError = true;
                        message = 'password not updated';
                        data.save();
                        return data;
                    });
                }

                return data;
            });
            message =
                !passwordChangedHasError && 'your data update successfully';

            return res.status(200).json({
                status: 200,
                message: message,
            });
        } catch (error) {
            logger.error('password reset code is not valid', error);
            return next(error);
        }
    }

    async delete(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | object> {}

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            if (!(email && password)) {
                return res.status(400).json({
                    status: 400,
                    message: 'email and password are required',
                });
            }

            const user = req.user && Object.assign(req.user);
            let role: string = USER_ROLE.WORKER;
            if (!user) {
                const error = new Error('An error occurred.');
                return next(error);
            }

            const isAdmin = await Admin.findOne({ user: user._id }).count();

            if (isAdmin) {
                role = USER_ROLE.ADMIN;
            }

            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);

                const body = { _id: user!._id, email: user.email };
                const token = jwt.sign(
                    { user: body },
                    config.authTokenSecret as string
                );

                await User.findOneAndUpdate(
                    { email: user.email },
                    { authToken: token }
                );

                return res.status(200).json({ status: 200, token, role });
            });
        } catch (error) {
            return next(error);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.header('authorization')?.split(' ')[1];
            const user = await User.findOne({ authToken: token }).select(
                'email'
            );
            req.logout(async function (err) {
                if (err) {
                    return next(err);
                }

                await User.findOneAndUpdate(
                    {
                        email: user && user.email,
                    },
                    { authToken: null }
                );

                res.status(200).json({
                    status: 200,
                    message: 'Loged Out Successfully',
                });
            });
        } catch (error) {
            return next(error);
        }
    };

    forgotPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const { email } = req.body;
            let user = await User.findOne({ email: email });
            if (!user)
                return res
                    .status(400)
                    .json({ status: 400, message: 'not found user' });

            const minNumberGenerated = 100000;
            const maxNumberGenerated = 1000000;
            const generateCode = Math.floor(
                Math.random() * (maxNumberGenerated - minNumberGenerated) +
                    minNumberGenerated
            ).toString();

            const updateToken = await User.findOneAndUpdate(
                { email: email },
                {
                    resetPasswordToken: generateCode,
                },
                { new: true }
            );
            user = JSON.parse(JSON.stringify(updateToken));

            if (user) {
                await this.sendResetPasswordEmail(
                    user.email,
                    generateCode,
                    next
                );
            }
            res.status(200).json({
                status: 200,
                message: 'password reset code sent to your email address',
            });
        } catch (error) {
            logger.error(error);
            return next(error);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        const { code, password } = req.body;
        if (!(code && password)) {
            return res.status(400).json({
                status: 400,
                message: 'Password or Code not sent',
            });
        }

        let codeValid = true;
        try {
            const user = await User.findOne({
                resetPasswordToken: code,
            })
                .then((data: any) => {
                    data.resetPasswordToken = null;
                    data.setPassword(password).then((data: any) => {
                        data.save();
                        return data;
                    });
                    return data;
                })
                .catch((err: any) => {
                    codeValid = false;
                });

            // !codeValid && !user
            if (!(codeValid || user)) {
                return res.status(400).json({
                    status: 400,
                    message: "Password reset code isn't valid",
                });
            }

            res.status(200).json({
                status: 200,
                message: 'password updated successfully',
            });
        } catch (error) {
            logger.error('An error occurred', { error: error });
            return next(error);
        }
    };

    private sendResetPasswordEmail = async (
        email: string,
        code: string,
        next: NextFunction
    ) => {
        try {
            const transporter = nodemailer.createTransport({
                service: config.emailService,
                auth: {
                    user: config.emailUser,
                    pass: config.emailPass,
                },
            });

            const resetPasswordTemplate = handlebars.compile(
                fs.readFileSync(
                    path.join(__dirname + '/emails/resetPassword.hbs'),
                    'utf8'
                )
            );

            transporter
                .sendMail({
                    from: config.emailUser,
                    to: email,
                    subject: 'Reset Password Smart Farm Application',
                    html: resetPasswordTemplate({ code: code }),
                })
                .then((data) => {
                    logger.error(
                        'Password Verification Code send successfully',
                        data
                    );
                    return next(data);
                });
        } catch (error) {
            logger.error('Password Verification not sent', error);
            return next(error);
        }
    };

    private sendVerificationEmail(
        email: string,
        code: string,
        next: NextFunction
    ) {
        try {
            const transporter = nodemailer.createTransport({
                service: config.emailService,
                auth: {
                    user: config.emailUser,
                    pass: config.emailPass,
                },
            });

            const emailTemplate = handlebars.compile(
                fs.readFileSync(
                    path.join(__dirname + `/emails/emailVerifiaction.hbs`),
                    'utf8'
                )
            );

            transporter
                .sendMail({
                    from: config.emailUser,
                    to: email,
                    subject: 'Email Verification',
                    html: emailTemplate({ email: email, code: code }),
                })
                .then((data) => {
                    logger.info('email sent successfully');
                });
        } catch (error) {
            logger.error('Email not sent');
            return next(error);
        }
    }
}

export default AuthController;

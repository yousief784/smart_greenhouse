import mongoose, { HydratedDocument, Schema } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import { UserModel } from '../interfaces/user.interface';

const userSchema: any = new Schema<UserModel>(
    {
        fullName: {
            type: String,
            min: [2, 'minumium charcter for full name is 2 char'],
            max: [50, 'Maxmium character for full name is 50 char'],
            required: [true, 'Full name is required'],
        },
        resetPasswordToken: {
            type: String,
            required: false,
            default: null,
        },
        emailVerificationCode: {
            type: String,
            required: false,
            default: null,
        },
        emailVerifiedAt: {
            type: Date,
            required: false,
            default: null,
        },
        authToken: {
            type: String,
            required: false,
            default: null,
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
});

const User = mongoose.model<UserModel>('User', userSchema);

export default User;

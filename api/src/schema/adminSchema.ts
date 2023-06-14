import mongoose, { Schema } from 'mongoose';
import { AdimnModel } from '../interfaces/admin.interface';

const adminSchema = new Schema<AdimnModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const Admin = mongoose.model<AdimnModel>('Admin', adminSchema);

export default Admin;

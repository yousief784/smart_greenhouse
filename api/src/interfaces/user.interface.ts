export interface UserModel extends Document {
    _id: string;
    fullName: string;
    email: string;
    password: string;
    resetPasswordToken: string | null;
    role: USER_ROLE;
    emailVerificationCode: string | null;
    emailVerifiedAt: string | null;
    authToken: string | null;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

export enum USER_ROLE {
    ADMIN = 'admin',
    WORKER = 'worker',
}

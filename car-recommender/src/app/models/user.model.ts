export interface UserModel {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    licenseNumber: string;
    dateOfBirth: string;
    role: 'user' | 'admin';
    createdAt: Date;
}

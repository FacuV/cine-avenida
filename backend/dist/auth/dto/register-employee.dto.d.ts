import { Role } from '../../common/enums';
export declare class RegisterEmployeeDto {
    name: string;
    lastName: string;
    dni: number;
    email: string;
    password: string;
    role?: Role;
    type?: number;
}

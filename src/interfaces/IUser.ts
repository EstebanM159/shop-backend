import { products } from '../../generated/prisma';

export type User = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  isActive: boolean;
  refreshToken: string;
  roles: string[];
  products: products[];
};

export type UserToken = Pick<User, 'email' | 'fullName' | 'id' | 'roles'>;

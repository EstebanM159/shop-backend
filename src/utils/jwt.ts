import jwt from 'jsonwebtoken';
import { UserToken } from '../interfaces/IUser';

export const verifyToken = (token: string) => {
  const isValid = jwt.verify(token, process.env.JWT_SECRET);
  return isValid;
};

export const generateTokens = (user: UserToken) => {
  const id = user.id;
  const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });
  const accessToken = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: '15m',
  });
  return { accessToken, refreshToken };
};

import { checkPassword, hashPassword } from '../utils/auth';
import { generateTokens, verifyToken } from '../utils/jwt';
import { PrismaClient } from '../../generated/prisma';
import { Request, Response } from 'express';
import { User, UserToken } from '../interfaces/IUser';
const prisma = new PrismaClient();

export class AuthController {
  static login = async (req: Request, res: Response) => {
    const { password, email } = req.body;
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect)
      return res.status(401).json({
        error: 'Contraseña incorrecta',
      });
    const safeUser: UserToken = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
    };
    const { accessToken, refreshToken } = generateTokens(safeUser);

    await prisma.users.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshToken,
      },
    });
    const currentUser = {
      ...safeUser,
      refreshToken,
    };
    return res.json({ accessToken, user: currentUser, refreshToken });
  };
  static register = async (req: Request, res: Response) => {
    const { email, fullname, password } = req.body;
    const userExists = await prisma.users.findUnique({
      where: {
        email,
      },
    });
    if (userExists)
      return res.status(401).json({
        error: 'Email ya registrado',
      });
    const passwordHashed = await hashPassword(password);
    const user = await prisma.users.create({
      data: {
        email: email,
        password: passwordHashed,
        fullName: fullname,
      },
    });
    const { accessToken, refreshToken } = generateTokens(user);

    await prisma.users.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshToken,
      },
    });
    const currentUser = {
      email: user.email,
      id: user.id,
      fullName: user.fullName,
      refreshToken: user.refreshToken,
      roles: user.roles,
    };
    res.send({ accessToken: accessToken, refreshToken: refreshToken, user: currentUser });
  };
  // old checkStatus
  static refreshToken = async (req: Request, res: Response) => {
    const { refreshToken: refreshTokenBody } = req.body;
    if (!refreshTokenBody) return res.status(401).json({ error: 'No hay refresh token' });

    const user = await prisma.users.findFirst({
      where: { refreshToken: refreshTokenBody },
      select: {
        email: true,
        id: true,
        fullName: true,
        refreshToken: true,
        roles: true,
      },
    });
    if (!user)
      return res.status(403).json({
        error: 'Token inválido, no existe un usuario con este token',
        token: refreshTokenBody,
      });

    try {
      const isValidToken = verifyToken(refreshTokenBody);
      if (!isValidToken) return res.status(403).json({ error: 'Token inválido' });

      const { accessToken, refreshToken } = generateTokens(user);

      await prisma.users.update({
        where: { id: user.id },
        data: { refreshToken: refreshToken },
      });

      return res.json({ accessToken, refreshToken, user });
    } catch (error) {
      return res.status(403).json({ error: 'Refresh token inválido o expirado' });
    }
  };
  static logout = async (req: Request, res: Response) => {
    const refreshToken = req.body;
    if (refreshToken) {
      await prisma.users.updateMany({
        where: { refreshToken },
        data: { refreshToken: null },
      });
    }
    return res.json({ message: 'Sesión cerrada' });
  };
}

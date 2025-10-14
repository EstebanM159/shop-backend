import bcrypt from 'bcrypt';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, users } from '../../generated/prisma';

type UserType = {
  id: string;
  email: string;
  fullName: string;
};
// declare global {
//   namespace Express {
//     interface Request {
//       user?: UserType;
//     }
//   }
// }

const prisma = new PrismaClient();

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function checkPassword(password: string, storedHash: string) {
  return await bcrypt.compare(password, storedHash);
}

// Funcion que se ejecuta antes de cada endpoint
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // Verifica si hay un token en el header de la request / en cada peticion http se va a mandar el token en el caso de estar logeado
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error('No esta autorizado para ingresar a esta sección');
    return res.status(401).json({ error: error.message });
  }
  // Si hay un token, lo extrae y lo decodifica
  const [, token] = bearer.split(' ');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // en el payload del token viene el id del que esta logeado
    if (typeof decoded === 'object' && decoded.id) {
      // Verifico que que exista el usuario y asigno en la req el objeto user que contiene (id,mail,name)
      const user = await prisma.users.findUnique({
        where: {
          id: decoded.id,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      });
      if (!user) {
        res.status(500).json({ error: 'Token no valido' });
      }
      next();
    }
  } catch (error) {
    res.status(500).json({ error: 'Token no valido' });
  }
};

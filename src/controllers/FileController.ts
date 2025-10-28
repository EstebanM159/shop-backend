import { UploadedFile } from 'express-fileupload';
import { PrismaClient } from '../../generated/prisma';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export class FileController {
  static fileProducts = async (req: Request, res: Response) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No se recibió ningún archivo' });
      }

      const fileVar = req.files.file as UploadedFile | UploadedFile[];
      const file = Array.isArray(fileVar) ? fileVar[0] : fileVar;
      if (!file) {
        return res.status(400).json({ error: 'No se recibió ningún archivo válido' });
      }

      const fileExtension = file.mimetype.split('/')[1];
      const uniqueName = `${Date.now()}.${fileExtension}`;

      res.json({ fileName: uniqueName });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al procesar archivo' });
    }
  };
}

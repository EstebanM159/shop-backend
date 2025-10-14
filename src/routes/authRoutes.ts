import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { handleInputErrors } from '../middlewares/handleInputErrors';
import { authenticate } from '../utils/auth';
const router = Router();

export default router;
// https://nest-teslo-shop-backend-y8ev.onrender.com/api
router.post(
  '/login',
  body('email')
    .isEmail()
    .withMessage('El formato no es el correcto')
    .notEmpty()
    .withMessage('El correo es obligatorio'),
  handleInputErrors,
  AuthController.login
);
router.post(
  '/register',
  body('email')
    .isEmail()
    .withMessage('El formato no es el correcto')
    .notEmpty()
    .withMessage('El correo es obligatorio'),
  body('fullname').notEmpty().withMessage('El nombre es obligatorio'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  handleInputErrors,
  AuthController.register
);
router.post('/refreshToken', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

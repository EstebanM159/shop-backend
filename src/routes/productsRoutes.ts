import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProductsController } from '../controllers/ProductsController';
import { handleInputErrors } from '../middlewares/handleInputErrors';
const router = Router();
router.get('/', ProductsController.getProducts);
router.get('/getByName', ProductsController.getProductsByName);
router.get(
  '/getById/:productId',
  param('productId').isUUID().withMessage('productId no valido'),
  ProductsController.getProductById
);
router.get('/getByTag', ProductsController.getProductByTag);
router.get(
  '/getBySlug/:slug',
  param('slig').isString().withMessage('slug no valido'),
  ProductsController.getProductBySlug
);

router.post(
  // todo Deberia estar authenticado para crear un producto asi poder asignar un userId al producto
  '/create',
  body('title').notEmpty().withMessage('El producto debe contener un titulo'),
  body('price').isNumeric().withMessage('El producto debe contener un precio'),
  body('description').notEmpty().withMessage('El producto debe contener una descripcion'),
  body('slug').notEmpty().withMessage('El producto debe contener un slug'),
  body('stock').notEmpty().withMessage('El producto debe contener un stock'),
  body('sizes').isArray().withMessage('Los talles deben estar en un array'),
  body('product_images').isArray().withMessage('Las imagenes deben estar en un array'),
  body('gender').notEmpty().withMessage('Los talles deben estar en un array'),
  body('tags').isArray().withMessage('Los talles deben estar en un array'),
  handleInputErrors,
  ProductsController.createProduct
);
router.patch(
  '/update/:productId',
  body('title').notEmpty().withMessage('El producto debe contener un titulo'),
  body('price').isNumeric().withMessage('El producto debe contener un precio'),
  body('description').notEmpty().withMessage('El producto debe contener una descripcion'),
  body('slug').notEmpty().withMessage('El producto debe contener un slug'),
  body('stock').notEmpty().withMessage('El producto debe contener un stock'),
  body('sizes').isArray().withMessage('Los talles deben estar en un array'),
  body('product_images').isArray().withMessage('Las imagenes deben estar en un array'),
  body('gender').notEmpty().withMessage('Los talles deben estar en un array'),
  body('tags').isArray().withMessage('Los talles deben estar en un array'),
  param('productId').isUUID().withMessage('productId no valido'),
  handleInputErrors,
  ProductsController.updateProduct
);
router.delete(
  '/delete/:productId',
  param('productId').isUUID().withMessage('productId no valido'),
  handleInputErrors,
  ProductsController.deleteProduct
);
export default router;

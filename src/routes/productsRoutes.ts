import { Router } from "express";
import { ProductsController } from "../controllers/ProductsController";
const router = Router();

router.get("/", ProductsController.getProducts);
router.get("/getByName", ProductsController.getProductsByName);

export default router;

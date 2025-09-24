import { PrismaClient } from "../../generated/prisma";
import { Request, Response } from "express";
import { generatePagination } from "../utils/pagination";
const prisma = new PrismaClient();
export class ProductsController {
  static getProducts = async (req: Request, res: Response) => {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;
    const gender = req.query.gender as string | undefined;

    const where = gender ? { gender: { contains: gender } } : {};

    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        skip,
        take,
        where,
        include: { product_images: true },
      }),
      prisma.products.count({ where }),
    ]);

    const result = generatePagination(products, totalProducts, take);
    return res.json(result);
  };
  static getProductsByName = async (req: Request, res: Response) => {
    const { query } = req.body;
    console.log("hola");
    console.log(query);
    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        where: {
          title: {
            contains: query,
          },
        },
      }),
      prisma.products.count(),
    ]);
    const result = generatePagination(products, totalProducts);
    return res.json(result);
  };
}
1;

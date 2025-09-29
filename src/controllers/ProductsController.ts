import { PrismaClient } from '../../generated/prisma';
import { Request, Response } from 'express';
import { generatePagination, takeSkipValues } from '../utils/pagination';
import { randomUUID } from 'crypto';
const prisma = new PrismaClient();

export class ProductsController {
  static getProducts = async (req: Request, res: Response) => {
    const { skip, take, gender } = takeSkipValues(req);
    const where = gender ? { gender: { contains: gender } } : {};

    try {
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
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: 'Hubo un error en la petición' });
    }
  };

  static getProductsByName = async (req: Request, res: Response) => {
    const { skip, take } = takeSkipValues(req);
    const { name } = req.query; // ✅ ahora por query param
    if (!name) return res.status(400).json({ error: 'El parámetro name es obligatorio' });

    try {
      const products = await prisma.products.findMany({
        skip,
        take,
        where: { title: { contains: String(name) } },
        include: { product_images: true },
      });

      // TODO aca tambien deberia buscar el usuario que creo esto
      const result = generatePagination(products, products.length, take);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static getProductByTag = async (req: Request, res: Response) => {
    const { skip, take, gender } = takeSkipValues(req);
    const { tag } = req.query; // ✅ ahora en params
    try {
      const products = await prisma.products.findMany({
        skip,
        take,
        where: {
          tags: {
            has: String(tag),
          },
        },
        include: { product_images: true },
      });
      if (!products) return res.status(404).json({ error: 'Tag no encontrado' });
      const result = generatePagination(products, products.length, take);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static getProductById = async (req: Request, res: Response) => {
    // Id debe ser UUID
    const { productId } = req.params; // ✅ ahora en params
    try {
      const product = await prisma.products.findUnique({
        where: { id: productId }, // importante castearlo a número
        include: { product_images: true },
      });
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      return res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };
  static createProduct = async (req: Request, res: Response) => {
    const { title, price, slug, gender, stock, tags, product_images, sizes } = req.body;
    try {
      const product = await prisma.products.create({
        data: {
          title: title,
          price: price,
          slug: slug,
          gender: gender,
          stock: stock,
          tags: tags,
          sizes: sizes,
          product_images: {
            create: product_images.map((image: { url: string }) => ({
              url: image.url,
            })),
          },
        },
        include: {
          product_images: true, // si querés devolverlas también
        },
      });
      return res.status(201).json({ message: 'Producto creado correctamente' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Hubo un error al actualizar el producto' });
    }
  };
  static updateProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { title, price, slug, gender, stock, tags, product_images, sizes } = req.body;
    try {
      const product = await prisma.products.update({
        where: {
          id: productId,
        },
        data: {
          title: title,
          price: price,
          slug: slug,
          gender: gender,
          stock: stock,
          tags: tags,
          sizes: sizes,
          product_images: {
            create: product_images.map((image: { url: string }) => ({
              url: image.url,
            })),
          },
        },
        include: {
          product_images: true, // si querés devolverlas también
        },
      });
      return res.status(201).json({ message: 'Producto actualizado correctamente', product });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Hubo un error al crear el producto' });
    }
  };
  static deleteProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;
    try {
      const result = await prisma.products.delete({
        where: {
          id: productId,
        },
      });
      return res.status(201).json('Producto eliminado correctamente');
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Hubo un error al borrar el producto' });
    }
  };
}

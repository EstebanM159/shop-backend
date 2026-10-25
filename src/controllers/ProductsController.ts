import { PrismaClient } from '../../generated/prisma';
import { Request, Response } from 'express';
import { generatePagination, takeSkipValues } from '../utils/pagination';

const prisma = new PrismaClient();

export class ProductsController {
  static getProducts = async (req: Request, res: Response) => {
    const { skip, take, gender, tag, size } = takeSkipValues(req);
    const where: any = {};

    if (gender) {
      where.gender = { equals: gender };
    }

    if (tag) {
      where.tags = { has: String(tag) };
    }

    if (size) {
      where.sizes = { has: String(size) };
    }
    try {
      const [products, totalProducts] = await Promise.all([
        prisma.products.findMany({
          skip,
          take,
          where,
          include: { product_images: { select: { url: true } } },
        }),
        prisma.products.count({ where }),
      ]);

      // Map product_images to array of strings (urls)
      const productsWithImageUrls = products.map((product) => ({
        ...product,
        images: product.product_images.map((img: { url: string }) => img.url),
        product_images: undefined,
      }));

      const result = generatePagination(productsWithImageUrls, totalProducts, take);
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: 'Hubo un error en la petición' });
    }
  };

  static getProductsByName = async (req: Request, res: Response) => {
    const { skip, take, query } = takeSkipValues(req);
    console.log(query);
    // if (!name) return res.status(400).json({ error: 'El parámetro name es obligatorio' });

    try {
      const products = await prisma.products.findMany({
        skip,
        take,
        where: { title: { contains: String(query), mode: 'insensitive' } },
        include: { product_images: { select: { url: true } } },
      });
      const productsWithImageUrls = products.map((product) => ({
        ...product,
        images: product.product_images.map((img: { url: string }) => img.url),
        product_images: undefined,
      }));
      const result = generatePagination(productsWithImageUrls, take);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };
  static getProductBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    try {
      const product = await prisma.products.findUnique({
        where: { slug },
        include: { product_images: true },
      });
      if (!product) return res.status(404).json({ error: 'Slug no encontrado' });

      // Map product_images to array of strings (urls)
      const productWithImageUrls = {
        ...product,
        images: product.product_images.map((img: { url: string }) => img.url),
        product_images: undefined,
      };

      return res.status(200).json(productWithImageUrls);
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };
  static getProductByTag = async (req: Request, res: Response) => {
    const { skip, take, gender } = takeSkipValues(req);
    const { tag } = req.query;
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
    const { productId } = req.params;
    try {
      const product = await prisma.products.findUnique({
        where: { id: productId }, // importante castearlo a número
        include: { product_images: true },
      });
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      const productWithImageUrls = {
        ...product,
        images: product.product_images.map((img: { url: string }) => img.url),
        product_images: undefined,
      };
      return res.status(200).json(productWithImageUrls);
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };
  static createProduct = async (req: Request, res: Response) => {
    const { title, price, slug, gender, stock, tags, images, sizes, description } = req.body;
    try {
      const product = await prisma.products.create({
        data: {
          title: title,
          price: price,
          slug: slug,
          gender: gender,
          stock: stock,
          description,
          tags: tags,
          sizes: sizes,
          product_images: {
            create: images.map((image: { url: string }) => ({
              url: image,
            })),
          },
        },
        include: {
          product_images: true, // si querés devolverlas también
        },
      });
      return res.status(201).json(product).send({ message: 'Producto creado correctamente' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Hubo un error al crear el producto' });
    }
  };
  static updateProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { title, price, slug, gender, stock, tags, images, sizes, description } = req.body;
    const productExists = await prisma.products.findUnique({
      where: {
        id: productId,
      },
    });
    if (!productExists) return res.status(404).json({ error: 'Producto no encontrado' });
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
          description,
          tags: tags,
          sizes: sizes,
          // ? esto actualiza las imagenes tmb?
          // Si se envían imágenes, primero eliminamos las existentes y luego creamos las nuevas para evitar duplicados.
          ...(images && Array.isArray(images) && images.length > 0
            ? {
                product_images: {
                  deleteMany: {},
                  create: images.map((image: any) => ({
                    url: typeof image === 'string' ? image : image.url,
                  })),
                },
              }
            : {}),
        },
        include: {
          product_images: true, // si querés devolverlas también
        },
      });
      return res.status(201).json({ message: 'Producto actualizado correctamente', product });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Hubo un error al actualizar el producto' });
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
  static getTags = async (req: Request, res: Response) => {
    try {
      const tags = await prisma.products.findMany({
        select: {
          tags: true,
          sizes: true,
        },
      });

      const allTags = [...new Set(tags.flatMap((p) => p.tags))];
      const allSizes = [...new Set(tags.flatMap((p) => p.sizes))];

      res.json({ allSizes, allTags });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Hubo un error al obtener los tags' });
    }
  };
}

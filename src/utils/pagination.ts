import { products } from "../../generated/prisma";
import { Request } from "express";

export type Pagination = {
  count: number; // total de productos en la base
  pages: number; // total de páginas
  products: products[];
};

export const generatePagination = (
  products: products[],
  totalProducts: number,
  take?: number
): Pagination => {
  const totalPages = Math.ceil(totalProducts / take);
  return {
    pages: totalPages,
    count: totalProducts,
    products,
  };
};

export const takeSkipValues = (req: Request) => {
  const skip = Number(req.query.skip) || 0;
  const take = Number(req.query.take) || 10;
  const gender = req.query.gender as string | undefined;

  return { skip, take, gender };
};

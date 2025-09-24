import { products } from "../../generated/prisma";

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
    products,
    count: totalProducts,
  };
};

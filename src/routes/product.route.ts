const productBase = '/products';

export const ProductRoutes = {
  getAllPaginated: `${productBase}`,
  getAll: `${productBase}/all`,
  getById: (id: string) => `${productBase}/${id}`,
  create: `${productBase}/create`,
  update: (id: string) => `${productBase}/${id}`,
  delete: (id: string) => `${productBase}/${id}`
};

export default ProductRoutes;
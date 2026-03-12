const productBase = '/products';

export const ProductRoutes = {
  getAllPaginated: `${productBase}/get-all-paginated`,
  getAll: `${productBase}/get-all`,
  getById: (id: string) => `${productBase}/get/${id}`,
  create: `${productBase}/create`,
  update: (id: string) => `${productBase}/update/${id}`,
  delete: (id: string) => `${productBase}/delete/${id}`
};

export default ProductRoutes;
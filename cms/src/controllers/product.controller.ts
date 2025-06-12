import { searchProducts } from '../services/products';
import { logger } from '../utils/logger.utils';

export const getProductBySkuController = async (sku: string) => {
  try {
    logger.info('Searching product by SKU:', sku);

    if (!sku) {
      throw new Error('Product SKU is required');
    }

    const product = await searchProducts({
      query: {
        exact: {
          field: 'variants.sku',
          value: sku,
        },
      },
      productProjectionParameters: {},
    });
    return product.results?.[0]?.productProjection;
  } catch (error) {
    logger.error('Controller error fetching product by SKU:', error);
    throw error;
  }
};

export const getProductsBySkuController = async (skus: string) => {
  try {
    logger.info('Searching products by SKUs:', skus);

    const skusArray = skus.split(',').map((sku) => sku.trim());

    if (!skusArray || skusArray.length === 0) {
      throw new Error('SKUs are required');
    }

    const products = await Promise.all(
      skusArray.map((sku) => getProductBySkuController(sku))
    );
    return products;
  } catch (error) {
    logger.error('Controller error fetching products by SKUs:', error);
    throw error;
  }
};

import {
  Drawer,
  useModalState,
} from '@commercetools-frontend/application-components';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { TCurrencyCode } from '@commercetools-uikit/money-input';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../contexts/auth-context';
import useStoreProducts from '../../hooks/use-store-products/use-store-products';
import ProductForm from '../products/product-form';
import { mapProductTailoringToProductFormData } from './mappers';

export interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  price: {
    currencyCode: TCurrencyCode;
    amount: string;
  };
  imageUrl: string;
  imageLabel: string;
  productType: {
    typeId: 'product-type';
    id: string;
  };
}

const ProductDetails = ({
  onBack,
  linkToWelcome,
}: {
  onBack: () => void;
  linkToWelcome: string;
}) => {
  const { productId } = useParams<{ productId: string }>();
  const { isModalOpen, openModal, closeModal } = useModalState(true);
  const { storeKey } = useAuthContext();
  const { createProduct, getProductById } = useStoreProducts({});
  const { dataLocale } = useApplicationContext();

  const [productData, setProductData] = useState<ProductFormData | null>(null);

  const handleBack = () => {
    onBack();
    closeModal();
  };

  useEffect(() => {
    const fetchProductData = async () => {
      const productData = await getProductById(productId);
      setProductData(
        mapProductTailoringToProductFormData(productData, dataLocale!)
      );
    };
    if (storeKey) {
      fetchProductData();
    }
  }, [productId, storeKey]);

  if (!productData) {
    return null;
  }

  return (
    <Drawer
      isOpen={isModalOpen}
      title="Product Details"
      hideControls
      size={20}
      onClose={handleBack}
    >
      <ProductForm
        isEdit={true}
        isCreate={false}
        initialData={productData}
        onBack={handleBack}
        onSubmit={async (productData) => {
          const success = await createProduct(productData);
          if (success) {
            closeModal();
          }
        }}
      />
    </Drawer>
  );
};

export default ProductDetails;

import {
  Drawer,
  useModalState,
} from '@commercetools-frontend/application-components';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { useIntl } from 'react-intl';
import { useAuthContext } from '../../contexts/auth-context';
import useStoreProducts from '../../hooks/use-store-products/use-store-products';
import messages from '../products/messages';
import ProductForm from '../products/product-form';
import { useProductWrapper } from '../products/store-products-wrapper';

interface Props {}

const AddNewProductButton = ({}: Props) => {
  const { isModalOpen, openModal, closeModal } = useModalState();
  const { createProduct } = useStoreProducts({});
  const { storeKey } = useAuthContext();
  const { fetchUserStoreProducts } = useProductWrapper();
  const intl = useIntl();

  return (
    <>
      <PrimaryButton
        label={intl.formatMessage(messages.addProduct)}
        onClick={() => openModal()}
        iconLeft={<PlusBoldIcon />}
        size="small"
      />
      <Drawer
        isOpen={isModalOpen}
        title="Create a product"
        hideControls
        size={20}
        onClose={closeModal}
      >
        <ProductForm
          channelKey={storeKey!}
          onBack={() => closeModal()}
          onSubmit={async (productData) => {
            const success = await createProduct(productData);
            if (success) {
              // Refresh product lists after creating a new product
              fetchUserStoreProducts();
              closeModal();
            }
          }}
        />
      </Drawer>
    </>
  );
};

export default AddNewProductButton;

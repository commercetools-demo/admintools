import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import AsyncSelectField from '@commercetools-uikit/async-select-field';
import Card from '@commercetools-uikit/card';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import MoneyInput from '@commercetools-uikit/money-input';
import { ContentNotification } from '@commercetools-uikit/notifications';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import { ProductDraft } from '@commercetools/platform-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from '../../contexts/auth-context';
import { useProductTypeConnector } from '../../hooks/use-product-type-connector';
import { ProductFormData } from '../product/details';
import messages from './messages';
import styles from './products.module.css';

interface ProductFormProps {
  initialData?: ProductFormData;
  onBack: () => void;
  onSubmit: (data: ProductDraft) => void;
  isEdit?: boolean;
  isCreate?: boolean;
}

// Product type definition (from provided JSON)

// Product data structure
const defaultFormData: ProductFormData = {
  name: '',
  description: '',
  sku: '',
  price: {
    currencyCode: 'USD',
    amount: '0',
  },
  imageUrl: '',
  imageLabel: 'Product Image',
  productType: {
    id: '',
    typeId: 'product-type',
  },
};

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  initialData,
  isCreate,
  isEdit,
}) => {
  const intl = useIntl();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { dataLocale } = useApplicationContext();
  const { distributionChannelId } = useAuthContext();
  const { getProductTypes } = useProductTypeConnector();
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || defaultFormData
  );
  const [productTypes, setProductTypes] = useState<
    { label: string; value: string }[]
  >([]);

  // Handle form input changes
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const fetchProductTypes = async () => {
    const productTypes = await getProductTypes();
    return productTypes.map((productType) => ({
      label: productType.name,
      value: productType.id,
    }));
  };

  const handlePriceChange = (value: string) => {
    setFormData({
      ...formData,
      price: {
        ...formData.price,
        amount: value,
      },
    });
  };

  // };

  // Form validation
  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.sku.trim() !== '' &&
      parseFloat(formData.price.amount) > 0
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Generate a unique slug
      const slug = `product_slug_${uuidv4()}`;

      // Convert price to cent amount (multiply by 100)
      const priceValue = MoneyInput.convertToMoneyValue(
        formData.price,
        dataLocale || 'en-US'
      );

      // Construct the product draft
      const productDraft: ProductDraft = {
        productType: formData.productType,
        name: {
          [dataLocale || 'en-US']: formData.name,
        },
        description: {
          [dataLocale || 'en-US']: formData.description || ' ',
        },
        slug: {
          [dataLocale || 'en-US']: slug,
        },
        masterVariant: {
          sku: formData.sku,
          prices: [
            {
              value: priceValue!,
              channel: {
                typeId: 'channel',
                id: distributionChannelId!,
              },
            },
          ],
          images: formData.imageUrl
            ? [
                {
                  url: formData.imageUrl,
                  label: 'Product Image',
                  dimensions: {
                    w: 500,
                    h: 500,
                  },
                },
              ]
            : [],
        },
        variants: [],
        publish: true,
      };

      // Call the onSubmit callback
      await onSubmit(productDraft);

      // Show success message
      setSuccessMessage(intl.formatMessage(messages.productCreateSuccess));

      // Reset form
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: {
          currencyCode: 'USD',
          amount: '0',
        },
        imageUrl: '',
        imageLabel: 'Product Image',
        productType: {
          id: '',
          typeId: 'product-type',
        },
      });
      // setPriceInputValue('0.00');
    } catch (err) {
      console.error('Error creating product:', err);
      setError(
        err instanceof Error ? err.message : 'Unknown error creating product'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const productTypeValue = useMemo(() => {
    const productTypeFound = productTypes.find(
      (productType) => productType.value === formData.productType.id
    );
    return {
      label: productTypeFound?.label,
      value: productTypeFound?.value,
    };
  }, [productTypes, formData.productType.id]);

  useEffect(() => {
    fetchProductTypes().then((productTypes) => {
      setProductTypes(productTypes);
    });
  }, []);

  return (
    <div className={styles.container}>
      <Spacings.Stack scale="l">
        {successMessage && (
          <ContentNotification type="success">
            <Text.Body>{successMessage}</Text.Body>
          </ContentNotification>
        )}

        {error && (
          <ContentNotification type="error">
            <Text.Body>{error}</Text.Body>
          </ContentNotification>
        )}

        <Card>
          <Spacings.Stack scale="m">
            <div className={styles.sectionTitle}>
              <Text.Subheadline as="h4">
                {intl.formatMessage(messages.productBasicInfo)}
              </Text.Subheadline>
            </div>

            <Spacings.Stack scale="s">
              <AsyncSelectField
                title={intl.formatMessage(messages.productType)}
                value={productTypeValue}
                onChange={(event) =>
                  handleInputChange('productType', {
                    id: (event.target.value as { value: string }).value,
                    typeId: 'product-type',
                  })
                }
                isReadOnly={!isCreate}
                isRequired
                defaultOptions={productTypes}
                loadOptions={fetchProductTypes}
              />
            </Spacings.Stack>
          </Spacings.Stack>
        </Card>

        <Card>
          <Spacings.Stack scale="m">
            <div className={styles.sectionTitle}>
              <Text.Subheadline as="h4">
                {intl.formatMessage(messages.productBasicInfo)}
              </Text.Subheadline>
            </div>

            <Spacings.Stack scale="s">
              <TextField
                title={intl.formatMessage(messages.productName)}
                value={formData.name}
                onChange={(event) =>
                  handleInputChange('name', event.target.value)
                }
                isRequired
                horizontalConstraint="scale"
              />

              <TextField
                title={intl.formatMessage(messages.productDescription)}
                value={formData.description}
                onChange={(event) =>
                  handleInputChange('description', event.target.value)
                }
                horizontalConstraint="scale"
              />
            </Spacings.Stack>
          </Spacings.Stack>
        </Card>

        <Card>
          <Spacings.Stack scale="m">
            <div className={styles.sectionTitle}>
              <Text.Subheadline as="h4">
                {intl.formatMessage(messages.masterVariant)}
              </Text.Subheadline>
            </div>

            <Spacings.Stack scale="s">
              <TextField
                title={intl.formatMessage(messages.variantSku)}
                value={formData.sku}
                onChange={(event) =>
                  handleInputChange('sku', event.target.value)
                }
                isRequired
                horizontalConstraint="scale"
              />

              <Spacings.Stack scale="xs">
                <Text.Subheadline as="h4">
                  {intl.formatMessage(messages.price)}
                </Text.Subheadline>
                <MoneyInput
                  value={formData.price}
                  onChange={(value) =>
                    handlePriceChange(value.target.value as string)
                  }
                />
                <Text.Detail tone="secondary">
                  {intl.formatMessage(messages.priceHint)}
                </Text.Detail>
              </Spacings.Stack>
            </Spacings.Stack>
          </Spacings.Stack>
        </Card>

        <Card>
          <Spacings.Stack scale="m">
            <div className={styles.sectionTitle}>
              <Text.Subheadline as="h4">
                {intl.formatMessage(messages.productImage)}
              </Text.Subheadline>
            </div>

            <Spacings.Stack scale="s">
              <TextField
                title={intl.formatMessage(messages.imageUrl)}
                value={formData.imageUrl}
                onChange={(event) =>
                  handleInputChange('imageUrl', event.target.value)
                }
                horizontalConstraint="scale"
              />

              <TextField
                title={intl.formatMessage(messages.imageLabel)}
                value={formData.imageLabel}
                onChange={(event) =>
                  handleInputChange('imageLabel', event.target.value)
                }
                horizontalConstraint="scale"
              />

              {formData.imageUrl && (
                <div className={styles.imagePreviewContainer}>
                  <Text.Detail tone="secondary">
                    {intl.formatMessage(messages.imagePreview)}
                  </Text.Detail>
                  <div className={styles.imagePreview}>
                    <img
                      src={formData.imageUrl}
                      alt={formData.imageLabel}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'https://via.placeholder.com/150?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                </div>
              )}
            </Spacings.Stack>
          </Spacings.Stack>
        </Card>

        <Spacings.Inline justifyContent="flex-end">
          <PrimaryButton
            label={intl.formatMessage(messages.createProductButton)}
            onClick={handleSubmit}
            isDisabled={!isFormValid() || isSubmitting}
          />
        </Spacings.Inline>

        {isSubmitting && (
          <div className={styles.loadingOverlay}>
            <LoadingSpinner scale="l" />
          </div>
        )}
      </Spacings.Stack>
    </div>
  );
};

export default ProductForm;

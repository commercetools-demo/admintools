import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import { useCallback } from 'react';

interface CommercetoolsError {
  statusCode: number;
  message: string;
}

const SHARED_CONTAINER = 'shared-sellertools-container';
const PRODUCT_SELECTION_KEY = 'main-catalog-product-selection';
const CUSTOMER_GROUP_KEY = 'seller-customer-group';

export const useCustomObject = () => {
  const context = useApplicationContext((context) => context);
  const dispatchAppsRead = useAsyncDispatch<TSdkAction, any>();

  const setCustomObject = useCallback(
    async (key: string, value: string) => {
      try {
        await dispatchAppsRead(
          actions.post({
            mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
            uri: `/${context?.project?.key}/custom-objects`,
            payload: {
              container: SHARED_CONTAINER,
              key: key,
              value: value,
            },
          })
        );
      } catch (error) {
        console.warn(`Failed to set custom object: ${error}`);
      }
    },
    [context?.project?.key, dispatchAppsRead]
  );

  const getCustomObject = useCallback(
    async (key: string) => {
      try {
        const result = await dispatchAppsRead(
          actions.get({
            mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
            uri: `/${context?.project?.key}/custom-objects/${SHARED_CONTAINER}/${key}`,
          })
        );

        return result;
      } catch (error) {
        const apiError = error as CommercetoolsError;
        if (apiError.statusCode === 404) {
          console.warn(`Custom object not found with key: ${key}`);
        }
        console.warn(`Failed to get custom object: ${apiError.message}`);
        return null;
      }
    },
    [context?.project?.key, dispatchAppsRead]
  );

  const getSelectedProductSelection = useCallback(async () => {
    const result = await getCustomObject(PRODUCT_SELECTION_KEY);
    if (result && result.value && typeof result.value === 'string') {
      return result.value;
    }
    return null;
  }, [getCustomObject]);

  const getSelectedCustomerGroup = useCallback(async () => {
    const result = await getCustomObject(CUSTOMER_GROUP_KEY);
    if (result && result.value && typeof result.value === 'string') {
      return result.value;
    }
    return null;
  }, [getCustomObject]);

  const setSelectedProductSelectionAndCustomerGroup = useCallback(
    async (productSelection: string, customerGroup: string) => {
      await setCustomObject(PRODUCT_SELECTION_KEY, productSelection);
      await setCustomObject(CUSTOMER_GROUP_KEY, customerGroup);
    },
    [setCustomObject]
  );

  return {
    getSelectedProductSelection,
    getSelectedCustomerGroup,
    setSelectedProductSelectionAndCustomerGroup,
  };
};

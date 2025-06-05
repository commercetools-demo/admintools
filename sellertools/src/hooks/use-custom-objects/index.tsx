import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import { MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
interface CommercetoolsError {
  statusCode: number;
  message: string;
}

export const useCustomObject = (container: string) => {
  const context = useApplicationContext((context) => context);
  const dispatchAppsRead = useAsyncDispatch<TSdkAction, any>();

  const getCustomObject = async (key: string) => {
    try {
      const result = await dispatchAppsRead(
        actions.get({
          mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
          uri: `/${context?.project?.key}/custom-objects/${container}/${key}`,
        })
      );

      return result;
    } catch (error) {
      const apiError = error as CommercetoolsError;
      if (apiError.statusCode === 404) {
        throw new Error(`Custom object not found with key: ${key}`);
      }
      throw new Error(`Failed to get custom object: ${apiError.message}`);
    }
  };

  return { getCustomObject };
};

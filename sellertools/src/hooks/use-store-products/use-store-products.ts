import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  GRAPHQL_TARGETS,
  MC_API_PROXY_TARGETS,
} from '@commercetools-frontend/constants';
import { TState } from '@commercetools-uikit/hooks';
import gql from 'graphql-tag';
import { useCallback, useState } from 'react';
import logger from '../../utils/logger';
import { useAuthContext } from '../../contexts/auth-context';
import { mapProductSearchResponse } from './mapper';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
import { ProductPagedSearchResponse } from '@commercetools/platform-sdk';
interface ProductSelectionResponse {
  productSelection?: {
    id: string;
    version: number;
    productRefs?: {
      results: Array<{
        product: {
          id: string;
          masterData: {
            current: {
              name: string;
              masterVariant: {
                images?: Array<{ url: string }>;
                sku?: string;
                key?: string;
              };
            };
          };
        };
      }>;
    };
  };
}

interface CreateProductResponse {
  createProduct?: {
    id: string;
    version: number;
  };
}

// GraphQL mutation to update product selection
const UPDATE_PRODUCT_SELECTION_MUTATION = gql`
  mutation UpdateProductSelection(
    $id: String!
    $version: Long!
    $actions: [ProductSelectionUpdateAction!]!
  ) {
    updateProductSelection(id: $id, version: $version, actions: $actions) {
      id
      version
    }
  }
`;

// GraphQL query to get product selection ID and version by key
const GET_PRODUCT_SELECTION_BY_KEY = gql`
  query GetProductSelectionByKey($key: String!) {
    productSelection(key: $key) {
      id
      version
    }
  }
`;

const buildSearchQuery = (
  includeProductSelectionId: string,
  excludeProductSelectionId?: string,
  searchText?: string,
  locale?: string
) => {
  const andExpressions = [];
  if (includeProductSelectionId) {
    andExpressions.push({
      exact: {
        field: 'productSelections',
        value: includeProductSelectionId,
      },
    });
  }

  if (excludeProductSelectionId) {
    andExpressions.push({
      not: [
        {
          exact: {
            field: 'productSelections',
            value: excludeProductSelectionId,
          },
        },
      ],
    });
  }

  if (searchText) {
    andExpressions.push({
      wildcard: {
        field: 'name',
        language: locale,
        value: `*${searchText}*`,
        caseInsensitive: true,
      },
    });
  }

  const query =
    andExpressions.length > 1
      ? {
          and: andExpressions,
        }
      : andExpressions[0];

  return query;
};

// GraphQL mutation to create a product
const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($draft: ProductDraft!) {
    createProduct(draft: $draft) {
      id
      version
    }
  }
`;

export interface ProductSearchResult {
  total: number;
  offset: number;
  limit: number;
  results: ProductData[];
}

// Product type definition
export interface ProductData {
  id: string;
  name: string;
  image: string;
  sku: string;
}

// Define the hook interface
interface UseStoreProductsResult {
  executeProductSearchQuery: (params: {
    includeProductSelectionId: string;
    excludeProductSelectionId?: string;
    limit?: number;
    offset?: number;
    locale?: string;
    searchText?: string;
  }) => Promise<ProductPagedSearchResponse | null>;
  fetchUserStoreProducts: () => Promise<ProductSearchResult>;
  fetchMasterStoreProducts: () => Promise<ProductSearchResult>;
  addProductsToStore: (
    storeKey: string,
    productIds: string[]
  ) => Promise<boolean>;
  removeProductsFromStore: (
    storeKey: string,
    productIds: string[]
  ) => Promise<boolean>;
  createProduct: (productDraft: any) => Promise<boolean>;
  searchStoreProducts: (searchText: string) => Promise<ProductSearchResult>;
  searchMasterProducts: (searchText: string) => Promise<ProductSearchResult>;
  loading: boolean;
  error: Error | null;
}

const useStoreProducts = ({
  page,
  perPage,
}: {
  page?: TState;
  perPage?: TState;
}): UseStoreProductsResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { dataLocale, project } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? 'en-us',
    project: context.project,
  }));
  const dispatchAppsRead = useAsyncDispatch<
    TSdkAction,
    ProductPagedSearchResponse
  >();

  const { masterProductSelectionId, productSelectionId } = useAuthContext();

  const executeProductSearchQuery = useCallback(
    async ({
      includeProductSelectionId,
      excludeProductSelectionId,
      limit = 20,
      offset = 0,
      locale = dataLocale,
      searchText = '',
    }: {
      includeProductSelectionId: string;
      excludeProductSelectionId?: string;
      limit?: number;
      offset?: number;
      locale?: string;
      searchText?: string;
    }) => {
      try {
        const result = await dispatchAppsRead(
          actions.post({
            mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
            uri: `/${project?.key}/products/search`,
            payload: {
              query: buildSearchQuery(
                includeProductSelectionId,
                excludeProductSelectionId,
                searchText,
                locale
              ),
              productProjectionParameters: {},
              limit,
              offset,
              locale,
            },
          })
        );

        return result;
      } catch (error: any) {
        console.warn(`Failed to execute graphql query: ${error.message}`);
        return null;
      }
    },
    [project?.key, dispatchAppsRead]
  );

  const { refetch: getProductSelectionByKey } = useMcQuery(
    GET_PRODUCT_SELECTION_BY_KEY,
    {
      variables: {
        key: 'placeholder', // Will be overridden
      },
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
      skip: true, // Skip initial query, we'll trigger it manually
    }
  );

  const [updateProductSelection] = useMcMutation(
    UPDATE_PRODUCT_SELECTION_MUTATION,
    {
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    }
  );

  const [createProductMutation] = useMcMutation(CREATE_PRODUCT_MUTATION, {
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  const fetchStoreProducts = useCallback(
    async (
      includeProductSelectionId: string,
      excludeProductSelectionId?: string
    ): Promise<ProductSearchResult> => {
      setLoading(true);
      setError(null);

      try {
        logger.info(
          `Fetching products for product selection: ${productSelectionId}`
        );
        const data = await executeProductSearchQuery({
          includeProductSelectionId,
          excludeProductSelectionId,
          limit: perPage?.value,
          offset: ((page?.value || 1) - 1) * (perPage?.value || 20),
          locale: dataLocale,
        });

        if (data?.results && Array.isArray(data.results)) {
          const products = data.results.map((item, index) =>
            mapProductSearchResponse(item, index, dataLocale)
          );

          logger.info(
            `Successfully fetched ${products.length} products for product selection ${productSelectionId}`
          );
          return {
            total: data.total,
            offset: data.offset,
            limit: data.limit,
            results: products,
          };
        }

        logger.info(
          `No products found for product selection ${productSelectionId}`
        );
        return {
          total: 0,
          offset: 0,
          limit: 0,
          results: [],
        };
      } catch (err) {
        logger.error(
          `Error fetching products for product selection ${productSelectionId}:`,
          err
        );
        setError(
          err instanceof Error
            ? err
            : new Error(
                `Unknown error loading products for product selection ${productSelectionId}`
              )
        );
        return {
          total: 0,
          offset: 0,
          limit: 0,
          results: [],
        };
      } finally {
        setLoading(false);
      }
    },
    [dataLocale, executeProductSearchQuery, perPage?.value, page?.value]
  );

  const addProductsToStore = useCallback(
    async (storeKey: string, productIds: string[]): Promise<boolean> => {
      if (!productIds.length) {
        logger.warn('No products selected to add');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        logger.info(
          `Adding ${productIds.length} products to store ${storeKey}`
        );

        // Step 1: Get the product selection ID and version
        const { data: selectionData } = (await getProductSelectionByKey({
          key: storeKey,
        })) as { data: ProductSelectionResponse };

        if (!selectionData?.productSelection?.id) {
          throw new Error(`Product selection for store ${storeKey} not found`);
        }

        const selectionId = selectionData.productSelection.id;
        const version = selectionData.productSelection.version;

        logger.info(
          `Found product selection: ${selectionId} (version ${version})`
        );

        // Step 2: Create actions to add each product
        const actions = productIds.map((productId) => ({
          addProduct: {
            product: {
              id: productId,
            },
          },
        }));

        // Step 3: Execute the mutation to update the product selection
        const result = await updateProductSelection({
          variables: {
            id: selectionId,
            version,
            actions,
          },
        });

        logger.info('Product selection updated successfully:', result);
        return true;
      } catch (err) {
        logger.error(`Error adding products to store ${storeKey}:`, err);
        setError(
          err instanceof Error
            ? err
            : new Error(`Unknown error adding products to store ${storeKey}`)
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getProductSelectionByKey, updateProductSelection]
  );

  const removeProductsFromStore = useCallback(
    async (storeKey: string, productIds: string[]): Promise<boolean> => {
      if (!productIds.length) {
        logger.warn('No products selected to remove');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        logger.info(
          `Removing ${productIds.length} products from store ${storeKey}`
        );

        // Step 1: Get the product selection ID and version
        const { data: selectionData } = (await getProductSelectionByKey({
          key: storeKey,
        })) as { data: ProductSelectionResponse };

        if (!selectionData?.productSelection?.id) {
          throw new Error(`Product selection for store ${storeKey} not found`);
        }

        const selectionId = selectionData.productSelection.id;
        const version = selectionData.productSelection.version;

        logger.info(
          `Found product selection: ${selectionId} (version ${version})`
        );

        // Step 2: Create actions to remove each product
        const actions = productIds.map((productId) => ({
          removeProduct: {
            product: {
              id: productId,
            },
          },
        }));

        // Step 3: Execute the mutation to update the product selection
        const result = await updateProductSelection({
          variables: {
            id: selectionId,
            version,
            actions,
          },
        });

        logger.info('Products successfully removed from selection:', result);
        return true;
      } catch (err) {
        logger.error(`Error removing products from store ${storeKey}:`, err);
        setError(
          err instanceof Error
            ? err
            : new Error(
                `Unknown error removing products from store ${storeKey}`
              )
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getProductSelectionByKey, updateProductSelection]
  );

  // Function to create a new product
  const createProduct = async (productDraft: any) => {
    setLoading(true);
    setError(null);

    try {
      // Add priceMode: Embedded to match the working example
      const finalProductDraft = {
        ...productDraft,
        priceMode: 'Embedded',
      };

      logger.info(
        'Creating product with data:',
        JSON.stringify(finalProductDraft, null, 2)
      );

      // Step 1: Create the product using the GraphQL mutation
      const result = await createProductMutation({
        variables: {
          draft: finalProductDraft,
        },
      }).catch((error) => {
        // Extract GraphQL specific error details
        const graphqlErrors = error.graphQLErrors || [];

        if (graphqlErrors.length > 0) {
          const errorDetails = graphqlErrors
            .map((err: any) => {
              logger.error(
                'GraphQL error details:',
                JSON.stringify(err, null, 2)
              );
              return `${err.message}${
                err.extensions?.code ? ` (${err.extensions.code})` : ''
              }`;
            })
            .join('\n');
          logger.error('GraphQL errors:', errorDetails);
          throw new Error(`Failed to create product: ${errorDetails}`);
        } else if (error.networkError) {
          logger.error('Network error:', error.networkError);
          throw new Error(
            'Network error when creating product. Please try again.'
          );
        } else {
          logger.error('Unexpected error:', error);
          throw error;
        }
      });

      // Type assertion to handle TypeScript type safety
      const data = result.data as CreateProductResponse;

      if (!data?.createProduct?.id) {
        throw new Error('Failed to create product: No product ID returned');
      }

      const productId = data.createProduct.id;
      logger.info('Product created successfully with ID:', productId);

      // Step 2: Add the product to the store's product selection if a channel key is provided
      if (productDraft.masterVariant.prices?.[0]?.channel?.key) {
        const storeKey = productDraft.masterVariant.prices[0].channel.key;

        // Add the newly created product to the store's product selection
        await addProductsToStore(storeKey, [productId]);
        logger.info(`Product ${productId} added to store ${storeKey}`);
      } else {
        logger.warn(
          'No channel key found in product draft, skipping add to product selection'
        );
      }

      return true;
    } catch (err) {
      logger.error('Error creating product:', err);
      setError(
        err instanceof Error ? err : new Error('Unknown error creating product')
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchProductsFunc = useCallback(
    async (
      includeProductSelectionId: string,
      searchText: string
    ): Promise<ProductSearchResult> => {
      setLoading(true);
      setError(null);

      try {
        logger.info(`Searching products with text: "${searchText}"`);
        const response = await executeProductSearchQuery({
          includeProductSelectionId,
          limit: perPage?.value,
          offset: ((page?.value || 1) - 1) * (perPage?.value || 20),
          locale: dataLocale,
          searchText,
        });

        // Log the raw response for debugging
        logger.info(
          'Raw search response data structure:',
          JSON.stringify(response?.results?.[0] || {}, null, 2)
        );

        if (response?.results && Array.isArray(response.results)) {
          logger.info(`Search found ${response.results.length} products`);

          const products = response.results.map((item, index: number) =>
            mapProductSearchResponse(item, index, dataLocale)
          );

          return {
            total: response.total,
            offset: response.offset,
            limit: response.limit,
            results: products,
          };
        }

        logger.info('No products found in search');
        return {
          total: 0,
          offset: 0,
          limit: 0,
          results: [],
        };
      } catch (err) {
        logger.error(`Error searching products:`, err);
        setError(
          err instanceof Error
            ? err
            : new Error(`Unknown error searching products`)
        );
        return {
          total: 0,
          offset: 0,
          limit: 0,
          results: [],
        };
      } finally {
        setLoading(false);
      }
    },
    [executeProductSearchQuery]
  );

  const fetchUserStoreProducts =
    useCallback(async (): Promise<ProductSearchResult> => {
      if (!productSelectionId) {
        console.warn('Product selection ID is required');
        return {
          total: 0,
          offset: 0,
          limit: 0,
          results: [],
        };
      }
      return fetchStoreProducts(productSelectionId);
    }, [fetchStoreProducts, productSelectionId]);

  const fetchMasterStoreProducts =
    useCallback(async (): Promise<ProductSearchResult> => {
      if (!masterProductSelectionId || !productSelectionId) {
        console.warn('Product selection ID is required');
        return {
          total: 0,
          offset: 0,
          limit: 0,
          results: [],
        };
      }
      return fetchStoreProducts(masterProductSelectionId, productSelectionId);
    }, [fetchStoreProducts, masterProductSelectionId, productSelectionId]);

  const searchStoreProducts = useCallback(
    async (searchText: string): Promise<ProductSearchResult> => {
      if (!productSelectionId) {
        console.warn('Product selection ID is required');
        return {
          total: 0,
          offset: 0,
          limit: 0,
          results: [],
        };
      }
      return searchProductsFunc(productSelectionId, searchText);
    },
    [searchProductsFunc, productSelectionId]
  );

  const searchMasterProducts = useCallback(
    async (searchText: string): Promise<ProductSearchResult> => {
      if (!masterProductSelectionId || !productSelectionId) {
        console.warn('Product selection ID is required');
        return {
          total: 0,
          offset: 0,
          limit: 0,
          results: [],
        };
      }
      return searchProductsFunc(masterProductSelectionId, searchText);
    },
    [searchProductsFunc, masterProductSelectionId, productSelectionId]
  );

  return {
    executeProductSearchQuery,
    fetchUserStoreProducts,
    fetchMasterStoreProducts,
    addProductsToStore,
    removeProductsFromStore,
    createProduct,
    searchStoreProducts,
    searchMasterProducts,
    loading,
    error,
  };
};

export default useStoreProducts;

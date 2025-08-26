import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { logger } from '../utils/logger.utils';
import sampleDatasources from '../samples/datasource';
import { CMS_DEPLOYED_URL_KEY, SHARED_CONTAINER } from '../constants';

export async function createServiceURLStorageLink(
  apiRoot: ByProjectKeyRequestBuilder,
  applicationUrl: string
): Promise<void> {
  await apiRoot
    .customObjects()
    .post({
      body: {
        key: CMS_DEPLOYED_URL_KEY,
        container: SHARED_CONTAINER,
        value: applicationUrl,
      },
    })
    .execute();
}

export async function createDefaultDatasources(
  apiRoot: ByProjectKeyRequestBuilder
): Promise<void> {
  logger.info('Creating default datasources...');
  try {
    await Promise.all(
      sampleDatasources.map(async (datasource) => {
        return apiRoot
          .customObjects()
          .post({
            body: {
              key: datasource.key,
              container: datasource.container,
              value: datasource.value,
            },
          })
          .execute();
      })
    );
    logger.info('Default datasources created successfully');
  } catch (error) {
    logger.error('Failed to create default datasources:', error);
  }
}

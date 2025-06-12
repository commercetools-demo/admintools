import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { CMS_DEPLOYED_URL_KEY, SHARED_CONTAINER } from '../constants';

export async function createCustomObject(
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

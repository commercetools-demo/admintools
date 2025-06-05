import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';

const SHARED_KEY = 'chat-app-deployed-url';
const SHARED_CONTAINER = 'temp-container';

export async function createCustomObject(
  apiRoot: ByProjectKeyRequestBuilder,
  applicationUrl: string
): Promise<void> {
  await apiRoot
    .customObjects()
    .post({
      body: {
        key: SHARED_KEY,
        container: SHARED_CONTAINER,
        value: applicationUrl,
      },
    })
    .execute();
}

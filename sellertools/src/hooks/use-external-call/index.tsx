import {
  buildApiUrl,
  executeHttpClientRequest,
} from '@commercetools-frontend/application-shell';
import createHttpUserAgent from '@commercetools/http-user-agent';

const userAgent = createHttpUserAgent({
  name: 'fetch-client',
  version: '1.0.0',
  // @ts-ignore
  libraryName: window.app.applicationName,
  contactEmail: 'support@my-company.com',
});

export const fetcherForwardTo = async (url: string, config: any = {}) => {
  const data = await executeHttpClientRequest(
    async (options) => {
      const res = await fetch(buildApiUrl('/proxy/forward-to'), options);
      const data = res.json();
      return {
        data,
        statusCode: res.status,
        getHeader: (key) => res.headers.get(key),
      };
    },
    {
      userAgent,
      headers: config.headers,
      forwardToConfig: {
        uri: url,
      },
    }
  );
  return data;
};

export const useExternalCall = () => {
  const fetch = async (url: string, config: any = {}) => {
    return fetcherForwardTo(url);
  };

  return { fetch };
};

import * as dotenv from 'dotenv';
dotenv.config();

export const MAX_VERSIONS = parseInt(process.env.MAX_VERSIONS || '5', 10);

export const CONTENT_ITEM_CONTAINER =
  process.env.CONTENT_ITEM_CONTAINER || 'content-item';

export const CONTENT_ITEM_STATE_CONTAINER =
  process.env.CONTENT_ITEM_STATE_CONTAINER || 'content-item-state';

export const CONTENT_ITEM_VERSION_CONTAINER =
  process.env.CONTENT_ITEM_VERSION_CONTAINER || 'content-item-version';

export const CONTENT_TYPE_CONTAINER =
  process.env.CONTENT_TYPE_CONTAINER || 'content-type';

export const DATASOURCE_CONTAINER =
  process.env.DATASOURCE_CONTAINER || 'datasource';

export const SHARED_CONTAINER = 'shared-sellertools-container';
export const CMS_DEPLOYED_URL_KEY = 'cms-app-deployed-url';

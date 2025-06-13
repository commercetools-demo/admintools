import { PERMISSIONS } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'sellertools',
  entryPointUriPath: '${env:ENTRY_POINT_URI_PATH}',
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  env: {
    production: {
      applicationId: '${env:CUSTOM_APPLICATION_ID}',
      url: '${env:APPLICATION_URL}',
    },
    development: {
      initialProjectKey: '${env:INITIAL_PROJECT_KEY}',
    },
  },
  additionalEnv: {
    JWT_TOKEN: '${env:JWT_TOKEN}',
    ASSOCIATE_ROLE: '${env:ASSOCIATE_ROLE}',
    MC_TEAM_NAME: '${env:MC_TEAM_NAME}',
  },
  headers: {
    csp: {
      'script-src': ['https://*.commercetools.app/', 'localhost:8080'],
      'connect-src': ['https://*.commercetools.app/', 'localhost:8080'],
    },
  },
  oAuthScopes: {
    view: [
      'view_products',
      'view_customers',
      'view_stores',
      'view_orders',
      'view_product_selections',
      'view_cart_discounts',
      'view_business_units',
      'view_key_value_documents',
      'view_customer_groups',
      'view_associate_roles',
    ],
    manage: [
      'manage_products',
      'manage_customers',
      'manage_stores',
      'manage_orders',
      'manage_product_selections',
      'manage_cart_discounts',
      'manage_business_units',
      'manage_associate_roles',
      'manage_key_value_documents'
    ],
  },
  headers: {
    csp: {
      'script-src': ['*.commercetools.app'],
      'connect-src': ['*.commercetools.app'],
    },
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/rocket.svg}',
  mainMenuLink: {
    defaultLabel: 'Dashboard',
    labelAllLocales: [],
    label: 'Dashboard',
    permissions: ['ManageDashboard'],
  },
  submenuLinks: [
    {
      uriPath: 'admin',
      label: 'Admin',
      defaultLabel: 'Admin',
      permissions: ['ManageAdmin'],
    },
  ],
};

export default config;

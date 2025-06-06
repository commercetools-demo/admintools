import { PERMISSIONS } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'Admintools',
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
    'CUSTOMER_GROUP': '${env:CUSTOMER_GROUP}',
    'ASSOCIATE_ROLE': '${env:ASSOCIATE_ROLE}',
    'MC_TEAM_NAME': '${env:MC_TEAM_NAME}',
  },
  oAuthScopes: {
    view: [
      'view_products', 
      'view_customers',
      'view_stores',
      'view_customer_groups',
      'view_business_units',
      'view_associate_roles',
      'view_key_value_documents',
      'view_product_selections'
    ],
    manage: [
      'manage_products', 
      'manage_customers', 
      'manage_stores', 
      'manage_customer_groups', 
      'manage_business_units',
      'manage_associate_roles',
      'manage_key_value_documents',
      'manage_product_selections'
    ]
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/rocket.svg}',
  mainMenuLink: {
    defaultLabel: 'Admintools',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  }
};

export default config;

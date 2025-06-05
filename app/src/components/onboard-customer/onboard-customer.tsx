import React from 'react';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Formik } from 'formik';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Card from '@commercetools-uikit/card';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { NOTIFICATION_KINDS_SIDE } from '@commercetools-frontend/constants';
import useCustomerManagement from '../../hooks/use-customer-management';
import useBusinessUnitManagement from '../../hooks/use-business-unit-management';
import useStoreManagement from '../../hooks/use-store-management';
import messages from './messages';
import styles from './onboard-customer.module.css';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

type TFormValues = {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

type TFieldErrors = Record<string, boolean>;

type TFormErrors = {
  companyName?: TFieldErrors;
  firstName?: TFieldErrors;
  lastName?: TFieldErrors;
  email?: TFieldErrors;
  phoneNumber?: TFieldErrors;
};

const validate = (values: TFormValues): TFormErrors => {
  const errors: TFormErrors = {};

  // Required field validation
  if (!values.companyName?.trim()) {
    errors.companyName = { missing: true };
  }
  if (!values.firstName?.trim()) {
    errors.firstName = { missing: true };
  }
  if (!values.lastName?.trim()) {
    errors.lastName = { missing: true };
  }
  if (!values.email?.trim()) {
    errors.email = { missing: true };
  }

  // Email validation - only validate format if email is provided
  if (values.email && values.email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = { invalid: true };
  }

  // Phone Number validation - only validate format if phone is provided
  if (values.phoneNumber && values.phoneNumber.trim() !== '' && !/^\+?[\d\s\-\(\)]+$/.test(values.phoneNumber)) {
    errors.phoneNumber = { invalid: true };
  }

  return errors;
};

const OnboardCustomer: React.FC = () => {
  const intl = useIntl();
  const history = useHistory();
  const showNotification = useShowNotification();
  
  // Custom hooks for GraphQL operations
  const customerManagement = useCustomerManagement();
  const businessUnitManagement = useBusinessUnitManagement();
  const storeManagement = useStoreManagement();

  const { environment }: { environment: { CUSTOMER_GROUP: string, ASSOCIATE_ROLE: string } } = useApplicationContext();
  
  // Loading state - true if any of the hooks are loading
  const isLoading = customerManagement.loading || businessUnitManagement.loading || storeManagement.loading;

  const handleBackToDashboard = () => {
    history.push('/');
  };

  const handleSubmit = async (values: TFormValues) => {
    try {
      console.log('🚀 Starting customer onboarding process...');
      console.log('📝 Form values:', values);
      
      // Transform company name to key format (lowercase, spaces to dashes)
      const companyKey = values.companyName.toLowerCase().replace(/\s+/g, '-');
      const companyName = values.companyName; // Keep original for display
      
      console.log('🔄 Company name transformation:', {
        original: companyName,
        key: companyKey
      });

      // Step 1: Create the customer with ExternalAuth and customer group
      console.log('👤 Step 1: Creating customer...');
      const customerGroupKey = environment?.CUSTOMER_GROUP;
    

      const customer = await customerManagement.createCustomer({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        companyName: companyName,
        authenticationMode: 'ExternalAuth',
        customerGroup: customerGroupKey ? {
          typeId: 'customer-group',
          key: customerGroupKey
        } : undefined
      });

      if (!customer) {
        throw new Error('Failed to create customer');
      }

      console.log('✅ Customer created successfully:', {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        companyName: customer.companyName,
        authenticationMode: 'ExternalAuth',
        customerGroup: customer.customerGroup?.key || 'none'
      });

      // Step 1.1: Create email verification token
      console.log('📧 Step 1.1: Creating email verification token...');
      const verificationToken = await customerManagement.createEmailVerificationToken(customer.id, 10);

      if (!verificationToken) {
        throw new Error('Failed to create email verification token');
      }

      console.log('✅ Email verification token created:', {
        customerId: customer.id,
        tokenLength: verificationToken.length,
        ttlMinutes: 10
      });

      // Step 1.2: Confirm email with the token
      console.log('✉️ Step 1.2: Confirming customer email...');
      const verifiedCustomer = await customerManagement.confirmEmail(verificationToken);

      if (!verifiedCustomer) {
        throw new Error('Failed to verify customer email');
      }

      console.log('✅ Customer email verified:', {
        id: verifiedCustomer.id,
        email: verifiedCustomer.email,
        isEmailVerified: verifiedCustomer.isEmailVerified
      });

      // Step 2: Create a channel for inventory and product distribution
      console.log('📺 Step 2: Creating channel...');
      const channelKey = `${companyKey}-channel`;
      const channel = await storeManagement.createChannel({
        key: channelKey,
        name: [
          {
            locale: 'en-US',
            value: `${companyName} Channel`,
          },
        ],
        description: [
          {
            locale: 'en-US',
            value: `Distribution and supply channel for ${companyName}`,
          },
        ],
        roles: ['InventorySupply', 'ProductDistribution'],
      });

      if (!channel) {
        throw new Error('Failed to create channel');
      }

      console.log('✅ Channel created successfully:', {
        id: channel.id,
        key: channel.key,
        roles: channel.roles,
      });

      // Step 3: Create a store that references the channel
      console.log('🏪 Step 3: Creating store...');
      const storeKey = `${companyKey}-store`;
      const store = await storeManagement.createStore({
        key: storeKey,
        name: [
          {
            locale: 'en-US',
            value: `${companyName} Store`,
          },
        ],
        distributionChannels: [{
          typeId: 'channel',
          key: channelKey,
        }],
      });

      if (!store) {
        throw new Error('Failed to create store');
      }

      console.log('✅ Store created successfully:', {
        id: store.id,
        key: store.key,
        name: store.name,
        distributionChannels: store.distributionChannels?.map((dc: any) => ({
          id: dc.id,
          key: dc.key,
        })),
      });

      // Step 4: Create business unit with associate and store references
      console.log('🏢 Step 4: Creating business unit with associate and store...');
      const associateRoleKey = environment?.ASSOCIATE_ROLE;
      console.log('👔 Associate role from env:', associateRoleKey);
      
      if (!associateRoleKey) {
        throw new Error('ASSOCIATE_ROLE environment variable is not set');
      }
      
      const businessUnit = await businessUnitManagement.createBusinessUnit({
        key: companyKey,
        name: companyName,
        unitType: 'Company',
        contactEmail: values.email,
        associates: [{
          customer: {
            typeId: 'customer',
            id: customer.id,
          },
          associateRoleAssignments: [{
            associateRole: {
              typeId: 'associate-role',
              key: associateRoleKey,
            },
          }],
        }],
        stores: [{
          typeId: 'store',
          key: storeKey,
        }],
        storeMode: 'Explicit',
      });

      if (!businessUnit) {
        throw new Error('Failed to create business unit');
      }

      console.log('✅ Business unit created successfully:', {
        id: businessUnit.id,
        key: businessUnit.key,
        name: businessUnit.name,
        unitType: businessUnit.unitType,
        associates: businessUnit.associates?.map((a: any) => ({
          customerId: a.customer.id,
          email: a.customer.email,
          roles: a.associateRoleAssignments.map((r: any) => r.associateRole.key),
        })),
        stores: businessUnit.stores?.map((s: any) => ({
          id: s.id,
          key: s.key,
          name: s.name,
        })),
      });

      // 📊 Final Summary
      console.log('🎉 === ONBOARD CUSTOMER COMPLETE ===');
      console.log('📊 Summary of created resources:');
      console.log('👤 Customer:', {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        customerGroup: customerGroupKey,
        emailVerified: true
      });
      console.log('🏢 Business Unit:', {
        id: businessUnit.id,
        key: businessUnit.key,
        name: businessUnit.name,
        unitType: businessUnit.unitType,
        associates: businessUnit.associates?.length || 0,
        stores: businessUnit.stores?.length || 0
      });
      console.log('📺 Channel:', {
        id: channel.id,
        key: channel.key,
        roles: channel.roles
      });
      console.log('🏪 Store:', {
        id: store.id,
        key: store.key,
        name: store.name,
        distributionChannels: store.distributionChannels?.length || 0
      });
      console.log('🔗 Relationships:');
      console.log('  • Customer → Business Unit (as admin associate)');
      console.log('  • Store → Business Unit (store assignment)');
      console.log('  • Store → Channel (distribution channel)');
      console.log('✅ All resources created and linked successfully!');

      // Success notification
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.success,
        domain: 'side',
        text: intl.formatMessage(
          { id: 'OnboardCustomer.success', defaultMessage: 'Customer {name} has been successfully onboarded!' },
          { name: `${values.firstName} ${values.lastName}` }
        ),
      });

      // Navigate back to dashboard
      history.push('/');

    } catch (error) {
      console.error('❌ Onboarding error occurred:', error);
      console.error('🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Error notification
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.error,
        domain: 'side',
        text: intl.formatMessage(
          { id: 'OnboardCustomer.error.general', defaultMessage: 'Failed to onboard customer. Please try again.' }
        ),
      });
    }
  };

  const renderError = (key: string) => {
    switch (key) {
      case 'missing':
        return intl.formatMessage({ id: 'OnboardCustomer.error.missing', defaultMessage: 'This field is required' });
      case 'invalid':
        return intl.formatMessage({ id: 'OnboardCustomer.error.invalid', defaultMessage: 'This field is invalid' });
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Text.Headline as="h1">
            {intl.formatMessage(messages.title)}
          </Text.Headline>
          <Text.Detail>
            {intl.formatMessage(messages.subtitle)}
          </Text.Detail>
        </div>
        <div className={styles.actionButtons}>
          <PrimaryButton
            label={intl.formatMessage(messages.backToAdmin)}
            onClick={handleBackToDashboard}
            isDisabled={isLoading}
          />
        </div>
      </div>

      <div className={styles.formContainer}>
        <Card className={styles.formCard}>
          <Spacings.Stack scale="l">
            <Formik
              initialValues={{
                companyName: '',
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
              }}
              validate={validate}
              onSubmit={handleSubmit}
            >
              {(formikProps) => (
                <form onSubmit={formikProps.handleSubmit}>
                  <Spacings.Stack scale="m">
                    <TextField
                      name="companyName"
                      value={formikProps.values.companyName}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      title={intl.formatMessage(messages.companyName)}
                      errors={formikProps.errors.companyName as unknown as TFieldErrors}
                      touched={formikProps.touched.companyName}
                      renderError={renderError}
                      horizontalConstraint={16}
                      isRequired
                    />
                    
                    <TextField
                      name="firstName"
                      value={formikProps.values.firstName}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      title={intl.formatMessage(messages.firstName)}
                      errors={formikProps.errors.firstName as unknown as TFieldErrors}
                      touched={formikProps.touched.firstName}
                      renderError={renderError}
                      horizontalConstraint={16}
                      isRequired
                    />
                    
                    <TextField
                      name="lastName"
                      value={formikProps.values.lastName}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      title={intl.formatMessage(messages.lastName)}
                      errors={formikProps.errors.lastName as unknown as TFieldErrors}
                      touched={formikProps.touched.lastName}
                      renderError={renderError}
                      horizontalConstraint={16}
                      isRequired
                    />
                    
                    <TextField
                      name="email"
                      value={formikProps.values.email}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      title={intl.formatMessage(messages.email)}
                      errors={formikProps.errors.email as unknown as TFieldErrors}
                      touched={formikProps.touched.email}
                      renderError={renderError}
                      horizontalConstraint={16}
                      isRequired
                    />
                    
                    <TextField
                      name="phoneNumber"
                      value={formikProps.values.phoneNumber}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      title={intl.formatMessage(messages.phoneNumber)}
                      errors={formikProps.errors.phoneNumber as unknown as TFieldErrors}
                      touched={formikProps.touched.phoneNumber}
                      renderError={renderError}
                      horizontalConstraint={16}
                    />
                    
                    <div className={styles.buttonsContainer}>
                      <PrimaryButton
                        label={intl.formatMessage(messages.submit)}
                        type="submit"
                        isDisabled={formikProps.isSubmitting || isLoading}
                        size="20"
                      />
                    </div>
                  </Spacings.Stack>
                </form>
              )}
            </Formik>
          </Spacings.Stack>
        </Card>
      </div>
    </div>
  );
};

export default OnboardCustomer; 
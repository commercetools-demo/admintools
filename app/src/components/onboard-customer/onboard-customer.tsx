import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { Formik } from 'formik';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Card from '@commercetools-uikit/card';
import messages from './messages';
import styles from './onboard-customer.module.css';

type TFormValues = {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

type TFieldErrors = Record<string, boolean>;

type TFormErrors = {
  companyName?: TFieldErrors;
  firstName?: TFieldErrors;
  lastName?: TFieldErrors;
  email?: TFieldErrors;
  phoneNumber?: TFieldErrors;
  password?: TFieldErrors;
};

const validate = (values: TFormValues): TFormErrors => {
  const errors: TFormErrors = {};

  // Company Name validation
  if (!values.companyName || values.companyName.trim() === '') {
    errors.companyName = { missing: true };
  }

  // First Name validation
  if (!values.firstName || values.firstName.trim() === '') {
    errors.firstName = { missing: true };
  }

  // Last Name validation
  if (!values.lastName || values.lastName.trim() === '') {
    errors.lastName = { missing: true };
  }

  // Email validation
  if (!values.email || values.email.trim() === '') {
    errors.email = { missing: true };
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = { invalid: true };
  }

  // Phone Number validation (optional but if provided, should be valid)
  if (values.phoneNumber && values.phoneNumber.trim() !== '' && !/^\+?[\d\s\-\(\)]+$/.test(values.phoneNumber)) {
    errors.phoneNumber = { invalid: true };
  }

  // Password validation
  if (!values.password || values.password.trim() === '') {
    errors.password = { missing: true };
  } else if (values.password.length < 8) {
    errors.password = { tooShort: true };
  }

  return errors;
};

const OnboardCustomer: React.FC = () => {
  const intl = useIntl();
  const history = useHistory();

  const handleBackToDashboard = () => {
    history.push('/');
  };

  const handleSubmit = async (values: TFormValues) => {
    // Here you would typically send the data to your API
    console.log('Form submitted:', values);
    
    // Optionally navigate back to dashboard after submission
    // history.push('/');
  };

  const renderError = (key: string, error?: boolean) => {
    switch (key) {
      case 'invalid':
        return intl.formatMessage({ id: 'OnboardCustomer.error.invalid', defaultMessage: 'This field is invalid' });
      case 'tooShort':
        return intl.formatMessage({ id: 'OnboardCustomer.error.tooShort', defaultMessage: 'Password must be at least 8 characters' });
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
                password: '',
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
                      isRequired
                      horizontalConstraint={16}
                    />
                    
                    <TextField
                      name="firstName"
                      value={formikProps.values.firstName}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      title={intl.formatMessage(messages.firstName)}
                      errors={formikProps.errors.firstName as unknown as TFieldErrors}
                      touched={formikProps.touched.firstName}
                      isRequired
                      horizontalConstraint={16}
                    />
                    
                    <TextField
                      name="lastName"
                      value={formikProps.values.lastName}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      title={intl.formatMessage(messages.lastName)}
                      errors={formikProps.errors.lastName as unknown as TFieldErrors}
                      touched={formikProps.touched.lastName}
                      isRequired
                      horizontalConstraint={16}
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
                      isRequired
                      horizontalConstraint={16}
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
                    
                    <TextField
                      name="password"
                      value={formikProps.values.password}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      title={intl.formatMessage(messages.password)}
                      errors={formikProps.errors.password as unknown as TFieldErrors}
                      touched={formikProps.touched.password}
                      renderError={renderError}
                      isRequired
                      horizontalConstraint={16}
                      autoComplete="new-password"
                    />
                    
                    <div className={styles.buttonsContainer}>
                      <PrimaryButton
                        label={intl.formatMessage(messages.submit)}
                        type="submit"
                        isDisabled={formikProps.isSubmitting}
                        size="big"
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
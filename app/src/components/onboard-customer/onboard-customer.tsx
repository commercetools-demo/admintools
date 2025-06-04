import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import { BackIcon } from '@commercetools-uikit/icons';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import messages from './messages';
import styles from './onboard-customer.module.css';

type TFormState = {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

const OnboardCustomer: React.FC = () => {
  const intl = useIntl();
  const history = useHistory();
  
  const [formState, setFormState] = useState<TFormState>({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const handleBackToDashboard = () => {
    history.push('/');
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Here you would typically send the data to your API
    console.log('Form submitted:', formState);
    
    // Optionally navigate back to dashboard after submission
    // history.push('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <SecondaryButton
          label={intl.formatMessage(messages.backToAdmin)}
          onClick={handleBackToDashboard}
          iconLeft={<BackIcon />}
          className={styles.backButton}
        />
        <div className={styles.title}>
          <Text.Headline as="h1" intlMessage={messages.title} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <Spacings.Stack scale="l">
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <TextField
                  name="companyName"
                  value={formState.companyName}
                  onChange={handleChange}
                  title={intl.formatMessage(messages.companyName)}
                  horizontalConstraint={16}
                  isRequired
                />
              </div>
              <div>
                <TextField
                  name="firstName"
                  value={formState.firstName}
                  onChange={handleChange}
                  title={intl.formatMessage(messages.firstName)}
                  horizontalConstraint={16}
                  isRequired
                />
              </div>
              <div>
                <TextField
                  name="lastName"
                  value={formState.lastName}
                  onChange={handleChange}
                  title={intl.formatMessage(messages.lastName)}
                  horizontalConstraint={16}
                  isRequired
                />
              </div>
              <div>
                <TextField
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  title={intl.formatMessage(messages.email)}
                  horizontalConstraint={16}
                  isRequired
                />
              </div>
              <div>
                <TextField
                  name="phoneNumber"
                  value={formState.phoneNumber}
                  onChange={handleChange}
                  title={intl.formatMessage(messages.phoneNumber)}
                  horizontalConstraint={16}
                />
              </div>
              <div className={styles.fullWidth}>
                <TextField
                  name="password"
                  value={formState.password}
                  onChange={handleChange}
                  title={intl.formatMessage(messages.password)}
                  horizontalConstraint={16}
                  isRequired
                />
              </div>
            </div>
            
            <div className={styles.buttonsContainer}>
              <PrimaryButton
                label={intl.formatMessage(messages.submit)}
                type="submit"
                className={styles.submitButton}
              />
            </div>
          </Spacings.Stack>
        </div>
      </form>
    </div>
  );
};

export default OnboardCustomer; 
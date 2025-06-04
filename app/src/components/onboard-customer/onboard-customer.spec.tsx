import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import OnboardCustomer from './onboard-customer';

jest.mock('@commercetools-uikit/icons', () => ({
  BackIcon: () => <div data-testid="back-icon" />,
}));

describe('OnboardCustomer', () => {
  const renderComponent = () =>
    render(
      <IntlProvider 
        locale="en" 
        messages={{
          "OnboardCustomer.title": "Onboard Customer",
          "OnboardCustomer.backToAdmin": "Back to Dashboard",
          "OnboardCustomer.companyName": "Company Name",
          "OnboardCustomer.firstName": "First Name",
          "OnboardCustomer.lastName": "Last Name",
          "OnboardCustomer.email": "Email",
          "OnboardCustomer.phoneNumber": "Phone Number",
          "OnboardCustomer.password": "Password",
          "OnboardCustomer.submit": "Submit"
        }}
      >
        <MemoryRouter>
          <OnboardCustomer />
        </MemoryRouter>
      </IntlProvider>
    );

  it('should render the form with all input fields', () => {
    renderComponent();
    
    expect(screen.getByText('Onboard Customer')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });
}); 
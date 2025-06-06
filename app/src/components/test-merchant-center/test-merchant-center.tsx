import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Card from '@commercetools-uikit/card';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import { NOTIFICATION_KINDS_SIDE } from '@commercetools-frontend/constants';
import useMerchantCenterManagement from '../../hooks/use-merchant-center-management';

const TestMerchantCenter: React.FC = () => {
  const intl = useIntl();
  const showNotification = useShowNotification();
  const [email, setEmail] = useState('test@example.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const merchantCenterManagement = useMerchantCenterManagement();

  const handleTest = async () => {
    if (!email.trim()) {
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.error,
        domain: 'side',
        text: 'Please enter an email address',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🧪 Testing Merchant Center invitation sequence...');
      console.log(`📧 Email: ${email}`);
      
      const invitationSuccess = await merchantCenterManagement.inviteSellerToMerchantCenter(email);

      if (invitationSuccess) {
        console.log('✅ Test successful - Merchant Center invitation sent');
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.success,
          domain: 'side',
          text: `✅ Invitation sent successfully to ${email}`,
        });
      } else {
        console.warn('⚠️ Test failed - Merchant Center invitation failed');
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.warning,
          domain: 'side',
          text: `⚠️ Invitation failed for ${email}`,
        });
      }
    } catch (error) {
      console.error('❌ Test error:', error);
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.error,
        domain: 'side',
        text: `❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Spacings.Stack scale="l">
        <Text.Headline as="h1">
          🧪 Test Merchant Center Invitation
        </Text.Headline>
        
        <Text.Detail>
          This component tests only the Merchant Center invitation sequence without creating any other resources.
        </Text.Detail>

        <Card>
          <Spacings.Stack scale="m">
            <TextField
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              title="Email Address"
              placeholder="Enter email to test invitation"
              horizontalConstraint={16}
              isRequired
            />
            
            <PrimaryButton
              label="🚀 Test Merchant Center Invitation"
              onClick={handleTest}
              isDisabled={isSubmitting || merchantCenterManagement.loading}
              size="20"
            />
            
            {merchantCenterManagement.loading && (
              <Text.Detail tone="information">
                ⏳ Testing Merchant Center invitation...
              </Text.Detail>
            )}
          </Spacings.Stack>
        </Card>

        <Card>
          <Spacings.Stack scale="s">
            <Text.Subheadline as="h4">📋 Test Sequence:</Text.Subheadline>
            <Text.Detail>
              1. 🔍 Get project info (organization ID, team ID)<br/>
              2. 📧 Validate email for invitation<br/>
              3. 📨 Send Merchant Center invitation
            </Text.Detail>
            <Text.Detail tone="secondary">
              💡 Check the browser console for detailed logs
            </Text.Detail>
          </Spacings.Stack>
        </Card>
      </Spacings.Stack>
    </div>
  );
};

export default TestMerchantCenter; 
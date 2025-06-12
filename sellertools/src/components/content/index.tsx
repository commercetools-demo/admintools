import { ErrorMessage } from '@commercetools-uikit/messages';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { CMS_DEPLOYED_URL_KEY } from '../../constants';
import { useAuthContext } from '../../contexts/auth-context';
import { useExternalUrl } from '../../hooks/use-external-url';
import styles from './content.module.css';
import CsmWrapper from './csm-wrapper';

type Props = {
  onBack: () => void;
  linkToWelcome: string;
};

const Content = ({ onBack }: Props) => {
  const { storeKey } = useAuthContext();
  const { deployedUrl, isLoading, isHealthy } = useExternalUrl({
    storedUrlKey: CMS_DEPLOYED_URL_KEY,
    healthCheckUrl: `/ping`,
    healthCheckHeaders: {},
  });

  if (isLoading) {
    return null;
  }

  if (!isHealthy || !deployedUrl) {
    return (
      <ErrorMessage>
        The content service is not available. Please contact support.
      </ErrorMessage>
    );
  }

  return (
    <Spacings.Stack scale="l">
      <div className={styles.header}>
        <div>
          <Text.Headline as="h1">Contentools</Text.Headline>
          <Text.Subheadline>
            Store: <span className={styles.storeKeyHighlight}>{storeKey}</span>
          </Text.Subheadline>
        </div>
        <Spacings.Inline scale="s">
          <PrimaryButton label="Back to Dashboard" onClick={onBack} />
        </Spacings.Inline>
      </div>
      {storeKey && (
        <CsmWrapper
          baseurl={deployedUrl}
          business-unit-key={storeKey}
          content-item-app-enabled="true"
          locale="en-US"
          available-locales='["en-US"]'
        />
      )}
    </Spacings.Stack>
  );
};

export default Content;
